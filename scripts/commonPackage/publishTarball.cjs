/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const child_process = require('node:child_process');

const REGISTRY = 'https://registry.npmjs.org';
const REGISTRY_AUTH_TOKEN_KEY = `npm_config_${REGISTRY.replace(/^https?:/, '')}/:_authToken`;
const MANIFEST_PATH = path.resolve(__dirname, '../../libs/common/manifest.json');

/**
 * Publishes the tarball written by `publish.ts pack <directory>`.
 * Usage: NPM_TOKEN=<token> node scripts/commonPackage/publishTarball.cjs <directory>
 */
function main() {
  const [artifactDirectory] = process.argv.slice(2);

  if (!artifactDirectory) {
    console.error(
      'Usage: NPM_TOKEN=<token> node scripts/commonPackage/publishTarball.cjs <directory>'
    );
    process.exit(1);
  }

  const token = process.env.NPM_TOKEN;

  if (!token) {
    console.log('::notice::NPM_TOKEN is not set. Skipping publish.');
    return;
  }

  const metadataPath = path.join(artifactDirectory, 'metadata.json');
  const { packageName, version, channel, sourceHash, tarball } = JSON.parse(
    fs.readFileSync(metadataPath, 'utf-8')
  );
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const tarballPath = path.resolve(artifactDirectory, tarball);

  const isMetadataMatchingManifest =
    version === manifest.version && channel === manifest.channel && sourceHash === manifest.hash;

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
    console.error(`::error::NPM_TOKEN is not valid for ${REGISTRY}.`);
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

  const isSameSource = !isUnpublished && viewOutput !== '' && JSON.parse(viewOutput) === sourceHash;

  if (isSameSource) {
    console.log(`::notice::${packageName}@${version} is already published with this source.`);
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

main();
