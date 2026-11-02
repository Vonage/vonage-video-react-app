import * as child_process from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyPackageHash } from './hash';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MONOREPO_ROOT = path.resolve(__dirname, '../..');
const DIST_PATH = path.join(MONOREPO_ROOT, 'libs/common/dist');
const REGISTRY = 'https://registry.npmjs.org';
const REGISTRY_AUTH_TOKEN_KEY = `npm_config_${REGISTRY.replace(/^https?:/, '')}/:_authToken`;
const CREDENTIAL_VARIABLE_PATTERN = /(^|:)_(authtoken|auth|password)$/;
const USAGE =
  'Usage: NPM_TOKEN=<token> npx tsx scripts/commonPackage/publish.ts [pack <directory>]';
const KEY_CTRL_C = '\u0003';
const KEY_ENTER = ['\r', '\n'];
const KEY_BACKSPACE = ['\u0008', '\u007f'];

/**
 * Publishes libs/common to npm with the version and channel (dist-tag) committed in manifest.json.
 * Usage: NPM_TOKEN=<token> npx tsx scripts/commonPackage/publish.ts (PUBLISH_DRY_RUN=1 for a dry run),
 * or `npx tsx scripts/commonPackage/publish.ts pack <directory>` to write the tarball and metadata.json.
 */
async function main(): Promise<void> {
  const [command, outputDirectory] = process.argv.slice(2);
  const isPackMode = command === 'pack' && Boolean(outputDirectory);

  if (command !== undefined && !isPackMode) {
    console.error(USAGE);
    process.exit(1);
  }

  const { packageName, version, channel, hash: sourceHash } = verifyPackageHash();
  const environmentWithoutToken = Object.fromEntries(
    Object.entries(process.env).filter(([name]) => !isCredentialVariable(name))
  );

  if (isPackMode) {
    const packDirectory = path.resolve(outputDirectory);
    buildPackage({ sourceHash, environment: environmentWithoutToken });
    fs.mkdirSync(packDirectory, { recursive: true });

    const packResult = child_process.spawnSync(
      'npm',
      ['pack', '--json', '--ignore-scripts', '--pack-destination', packDirectory],
      { cwd: DIST_PATH, encoding: 'utf-8', env: environmentWithoutToken }
    );

    if (packResult.status !== 0) {
      console.error('npm pack failed:');
      console.error(packResult.stderr.trim());
      process.exit(1);
    }

    const [{ filename: tarball }] = JSON.parse(packResult.stdout) as { filename: string }[];
    const metadata = { packageName, version, channel, sourceHash, tarball };
    const metadataPath = path.join(packDirectory, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + '\n');
    console.log(`\nPacked ${path.join(packDirectory, tarball)}`);
    console.log(`Wrote ${metadataPath}`);
    return;
  }

  const isDryRun = process.env.PUBLISH_DRY_RUN === '1';
  const token = await resolveToken({ isDryRun });
  const registryEnvironment = token
    ? { ...environmentWithoutToken, [REGISTRY_AUTH_TOKEN_KEY]: token }
    : environmentWithoutToken;

  const isAlreadyPublished = (() => {
    if (!token) {
      console.log('NPM_TOKEN not set: skipping registry checks.');
      return false;
    }
    return isPublishedWithSameHash({
      packageName,
      version,
      sourceHash,
      environment: registryEnvironment,
    });
  })();

  if (isAlreadyPublished && !isDryRun) {
    console.log('Skipping.');
    return;
  }

  buildPackage({ sourceHash, environment: environmentWithoutToken });

  const dryRunFlag = isDryRun ? ' --dry-run' : '';
  const publishCommand = `npm publish --tag ${channel} --registry ${REGISTRY} --ignore-scripts${dryRunFlag}`;
  console.log(`\nPublishing ${packageName}@${version} with tag "${channel}" to ${REGISTRY}...`);
  console.log(`> ${publishCommand}`);
  child_process.execSync(publishCommand, {
    cwd: DIST_PATH,
    stdio: 'inherit',
    env: registryEnvironment,
  });

  console.log(
    isDryRun ? '\nDry run finished. Nothing was published.' : '\nPublished successfully.'
  );
}

function buildPackage(args: { sourceHash: string; environment: NodeJS.ProcessEnv }): void {
  const { sourceHash, environment } = args;
  const distPackageJsonPath = path.join(DIST_PATH, 'package.json');

  fs.rmSync(DIST_PATH, { recursive: true, force: true });

  console.log('\nRunning tests...');
  child_process.execSync('pnpm nx run common:test', {
    cwd: MONOREPO_ROOT,
    stdio: 'inherit',
    env: environment,
  });

  console.log('\nBuilding package...');
  child_process.execSync('pnpm nx run common:build', {
    cwd: MONOREPO_ROOT,
    stdio: 'inherit',
    env: environment,
  });

  if (!fs.existsSync(distPackageJsonPath)) {
    console.error('dist/package.json not found. The build may have failed to copy it.');
    process.exit(1);
  }

  const distPackageJson = JSON.parse(fs.readFileSync(distPackageJsonPath, 'utf-8'));
  fs.writeFileSync(
    distPackageJsonPath,
    JSON.stringify({ ...distPackageJson, sourceHash }, null, 2) + '\n'
  );
}

async function resolveToken(args: { isDryRun: boolean }): Promise<string | null> {
  const tokenFromEnvironment = process.env.NPM_TOKEN;

  if (tokenFromEnvironment) return tokenFromEnvironment;
  if (args.isDryRun) return null;

  if (!process.stdin.isTTY) {
    console.error('Missing NPM_TOKEN, and stdin is not an interactive terminal to prompt for it.');
    console.error(USAGE);
    process.exit(1);
  }

  process.stdout.write('npm token (input hidden): ');

  const token = await new Promise<string>((resolve) => {
    let input = '';

    function stopReading() {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.removeListener('data', onData);
      process.stdout.write('\n');
    }

    function onData(character: string) {
      if (character === KEY_CTRL_C) {
        stopReading();
        process.exit(130);
      }

      if (KEY_ENTER.includes(character)) {
        stopReading();
        resolve(input.trim());
        return;
      }

      if (KEY_BACKSPACE.includes(character)) {
        input = input.slice(0, -1);
        return;
      }

      input += character;
    }

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', onData);
  });

  if (!token) {
    console.error('No token provided.');
    process.exit(1);
  }

  return token;
}

function isPublishedWithSameHash(args: {
  packageName: string;
  version: string;
  sourceHash: string;
  environment: NodeJS.ProcessEnv;
}): boolean {
  const { packageName, version, sourceHash, environment } = args;
  const runNpm = (npmArguments: string[]) =>
    child_process.spawnSync('npm', [...npmArguments, '--registry', REGISTRY], {
      encoding: 'utf-8',
      env: environment,
    });

  const whoami = runNpm(['whoami']);

  if (whoami.status !== 0) {
    console.error(`NPM_TOKEN is not valid for ${REGISTRY}.`);
    console.error(whoami.stderr.trim());
    process.exit(1);
  }

  console.log(`Authenticated to ${REGISTRY} as ${whoami.stdout.trim()}.`);

  const view = runNpm(['view', `${packageName}@${version}`, 'sourceHash', '--json']);
  const viewOutput = view.stdout.trim();
  const isUnpublished = view.status !== 0 && viewOutput.includes('"E404"');

  if (isUnpublished) return false;

  if (view.status !== 0) {
    console.error(`Could not read ${packageName}@${version} from ${REGISTRY}:`);
    console.error(viewOutput || view.stderr);
    process.exit(1);
  }

  const publishedHash = viewOutput ? JSON.parse(viewOutput) : null;

  if (publishedHash === sourceHash) {
    console.log(`${packageName}@${version} is already published with this source.`);
    return true;
  }

  console.error(`${packageName}@${version} is already published with different source.`);
  console.error('Bump the version: pnpm nx run common:version -- patch|minor|major|beta|X.Y.Z');
  process.exit(1);
}

function isCredentialVariable(name: string): boolean {
  const isTokenVariable = name === 'NPM_TOKEN' || name === 'NODE_AUTH_TOKEN';
  const npmConfigKey = name.toLowerCase().replace(/^npm_config_/, '');
  return isTokenVariable || CREDENTIAL_VARIABLE_PATTERN.test(npmConfigKey);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
