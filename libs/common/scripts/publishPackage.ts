import * as fs from 'node:fs';
import * as path from 'node:path';
import * as child_process from 'node:child_process';
import { fileURLToPath } from 'node:url';
import computeDistHash from './computeDistHash';
import { validateVersionSync, validateChannelFormat } from './helpers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const MONOREPO_ROOT = path.resolve(ROOT, '../..');
const MANIFEST_PATH = path.join(ROOT, 'manifest.json');
const PACKAGE_JSON_PATH = path.join(ROOT, 'package.json');
const DIST_PATH = path.join(ROOT, 'dist');
const DIST_PACKAGE_JSON_PATH = path.join(DIST_PATH, 'package.json');

const channel = process.argv[2];

if (channel !== 'latest' && channel !== 'beta') {
  console.error(`Invalid channel "${channel ?? '(none)'}". Must be "latest" or "beta".`);
  process.exit(1);
}

function run(args: { command: string; cwd: string }): void {
  const { command, cwd } = args;
  console.log(`\n> ${command}`);
  child_process.execSync(command, { cwd, stdio: 'inherit' });
}

if (fs.existsSync(DIST_PATH)) {
  console.log('Cleaning dist/...');
  fs.rmSync(DIST_PATH, { recursive: true, force: true });
}

console.log('\nRunning tests...');
run({ command: 'npx nx run common:test', cwd: MONOREPO_ROOT });

console.log('\nBuilding package...');
run({ command: 'npx nx run common:build', cwd: MONOREPO_ROOT });

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));

validateVersionSync({ manifestVersion: manifest.version, packageVersion: packageJson.version });
validateChannelFormat({ version: manifest.version, channel });

if (!fs.existsSync(DIST_PACKAGE_JSON_PATH)) {
  console.error('dist/package.json not found. The build may have failed to copy it.');
  process.exit(1);
}

const computedHash = computeDistHash(DIST_PATH);
const committedHash = manifest.hash;

if (computedHash !== committedHash) {
  console.error('Hash mismatch — dist does not match committed manifest.hash.');
  console.error(`  Committed: ${committedHash}`);
  console.error(`  Computed:  ${computedHash}`);
  console.error('Run "nx run common:hash:update" and commit the result.');
  process.exit(1);
}

console.log(`\nPublishing @vonage/video-common@${manifest.version} with tag "${channel}"...`);
run({
  command: `npm publish --tag ${channel} --registry https://npm.pkg.github.com`,
  cwd: DIST_PATH,
});

console.log('\nPublished successfully.');
