/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const child_process = require('node:child_process');

const REGISTRY = 'https://npm.pkg.github.com';
const REGISTRY_AUTH_TOKEN_KEY = `npm_config_${REGISTRY.replace(/^https?:/, '')}/:_authToken`;
const MANIFEST_PATH = path.resolve(__dirname, '../../libs/common/manifest.json');

/**
 * Publishes the tarball written by `publish.ts pack <directory>`.
 * Usage: NODE_AUTH_TOKEN=<token> node scripts/commonPackage/publishTarball.cjs <directory>
 */
function main() {
  const [artifactDirectory] = process.argv.slice(2);

  if (!artifactDirectory) {
    console.error(
      'Usage: NODE_AUTH_TOKEN=<token> node scripts/commonPackage/publishTarball.cjs <directory>'
    );
    process.exit(1);
  }

  const token = process.env.NODE_AUTH_TOKEN;

  if (!token) {
    console.log('::notice::NODE_AUTH_TOKEN is not set. Skipping publish.');
    return;
  }

  const metadataPath = path.join(artifactDirectory, 'metadata.json');
  const { packageName, version, channel, sourceHash, tarball } = JSON.parse(
    fs.readFileSync(metadataPath, 'utf-8')
  );
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const tarballPath = path.resolve(artifactDirectory, tarball);
  const isManualPublish = process.env.GITHUB_EVENT_NAME === 'workflow_dispatch';
  const expectedChannel =
    process.env.PUBLISH_CHANNEL || (isManualPublish ? 'beta' : manifest.channel);
  const expectedVersion = (() => {
    if (!isManualPublish) return manifest.version;
    const stableVersion = manifest.version.split('-')[0];
    return expectedChannel === 'beta'
      ? `${stableVersion}-beta.${process.env.GITHUB_RUN_ID}`
      : stableVersion;
  })();

  const isMetadataMatchingManifest =
    version === expectedVersion &&
    /^(\d+)\.(\d+)\.(\d+)(?:-beta\.\d+)?$/.test(version) &&
    channel === expectedChannel &&
    ['beta', 'latest'].includes(channel) &&
    sourceHash === manifest.hash;

  if (!isMetadataMatchingManifest) {
    console.error(`::error::${metadataPath} does not match the committed ${MANIFEST_PATH}.`);
    process.exit(1);
  }

  const tarballPackageJson = (() => {
    const result = child_process.spawnSync('tar', ['-xzOf', tarballPath, 'package/package.json'], {
      encoding: 'utf-8',
    });
    if (result.status !== 0) {
      console.error(`::error::Could not read package/package.json from ${tarballPath}.`);
      console.error(result.stderr.trim());
      process.exit(1);
    }
    return JSON.parse(result.stdout);
  })();

  const isTarballMatchingMetadata =
    tarballPackageJson.name === packageName &&
    tarballPackageJson.version === version &&
    tarballPackageJson.sourceHash === sourceHash;

  if (!isTarballMatchingMetadata) {
    console.error(`::error::${tarball} does not match ${metadataPath}.`);
    process.exit(1);
  }

  const environment = { ...process.env, [REGISTRY_AUTH_TOKEN_KEY]: token };

  const whoami = runNpm({ npmArguments: ['whoami'], environment });

  if (whoami.status !== 0) {
    console.error(`::error::NODE_AUTH_TOKEN is not valid for ${REGISTRY}.`);
    console.error(whoami.stderr.trim());
    process.exit(1);
  }

  console.log(`Authenticated to ${REGISTRY} as ${whoami.stdout.trim()}.`);

  const view = runNpm({
    npmArguments: ['view', `${packageName}@${version}`, 'sourceHash', '--json'],
    environment,
  });
  const viewOutput = view.stdout.trim();
  const isUnpublished = view.status !== 0 && viewOutput.includes('"E404"');

  if (!isUnpublished && view.status !== 0) {
    console.error(`::error::Could not read ${packageName}@${version} from ${REGISTRY}.`);
    console.error(viewOutput || view.stderr.trim());
    process.exit(1);
  }

  const publishedHash = (() => {
    if (isUnpublished) return null;
    if (viewOutput !== '') return JSON.parse(viewOutput);
    return readPublishedSourceHash({ packageName, version, environment });
  })();
  const isSameSource = publishedHash === sourceHash;

  if (isSameSource) {
    console.log(
      `::notice::${packageName}@${version} is already published with this source. Skipping publish.`
    );
    return;
  }

  if (!isUnpublished) {
    console.error(`::error::${packageName}@${version} is already published with different source.`);
    console.error('Bump the version: pnpm nx run common:version -- patch|minor|major|beta|X.Y.Z');
    process.exit(1);
  }

  console.log(`Publishing ${packageName}@${version} with tag "${channel}" to ${REGISTRY}...`);

  const publish = runNpm({
    npmArguments: ['publish', tarballPath, '--tag', channel, '--ignore-scripts'],
    environment,
  });

  console.log(publish.stdout.trim());
  console.error(publish.stderr.trim());

  if (publish.status !== 0) {
    console.error(`::error::npm publish failed for ${packageName}@${version}.`);
    process.exit(1);
  }

  console.log(`Published ${packageName}@${version}.`);
}

function runNpm({ npmArguments, environment }) {
  return child_process.spawnSync('npm', [...npmArguments, '--registry', REGISTRY], {
    encoding: 'utf-8',
    env: environment,
  });
}

function readPublishedSourceHash({ packageName, version, environment }) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'common-published-'));

  try {
    const download = runNpm({
      npmArguments: [
        'pack',
        `${packageName}@${version}`,
        '--json',
        '--ignore-scripts',
        '--pack-destination',
        directory,
      ],
      environment,
    });

    if (download.status !== 0) {
      throw new Error(`Could not download ${packageName}@${version}: ${download.stderr.trim()}`);
    }

    const [{ filename }] = JSON.parse(download.stdout);
    const manifest = child_process.spawnSync(
      'tar',
      ['-xzOf', path.join(directory, filename), 'package/package.json'],
      { encoding: 'utf-8' }
    );

    if (manifest.status !== 0) {
      throw new Error(`Could not read the published package manifest: ${manifest.stderr.trim()}`);
    }

    const publishedPackage = JSON.parse(manifest.stdout);
    const isPublishedPackageValid =
      publishedPackage.name === packageName &&
      publishedPackage.version === version &&
      typeof publishedPackage.sourceHash === 'string' &&
      publishedPackage.sourceHash !== '';

    if (!isPublishedPackageValid) {
      throw new Error(`Could not verify the published source hash for ${packageName}@${version}.`);
    }

    return publishedPackage.sourceHash;
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

main();
