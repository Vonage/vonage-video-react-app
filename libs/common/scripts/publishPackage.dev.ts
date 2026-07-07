import * as fs from 'node:fs';
import * as path from 'node:path';
import * as child_process from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const MONOREPO_ROOT = path.resolve(ROOT, '../..');
const MANIFEST_PATH = path.join(ROOT, 'manifest.json');
const PACKAGE_JSON_PATH = path.join(ROOT, 'package.json');
const DIST_PATH = path.join(ROOT, 'dist');
const DIST_PACKAGE_JSON_PATH = path.join(DIST_PATH, 'package.json');
const REGISTRY = 'https://npm.pkg.github.com';
const DEV_TAG = 'dev';

function run(args: { command: string; cwd: string }): void {
  const { command, cwd } = args;

  console.log(`\n> ${command}`);
  child_process.execSync(command, { cwd, stdio: 'inherit' });
}

function exec(args: { command: string; cwd: string }): string {
  const { command, cwd } = args;

  return child_process.execSync(command, {
    cwd,
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

function resolveGitHubUsername(): string {
  const result = exec({
    command: `npm whoami --registry ${REGISTRY}`,
    cwd: ROOT,
  }).trim();

  if (!result) {
    console.error('Could not resolve GitHub username from npm whoami.');
    console.error('Ensure NODE_AUTH_TOKEN is set with a valid GitHub personal access token.');
    process.exit(1);
  }

  return result;
}

function getPublishedVersions(packageName: string): string[] {
  try {
    const result = exec({
      command: `npm view ${packageName} versions --json --registry ${REGISTRY}`,
      cwd: ROOT,
    }).trim();

    if (!result) {
      return [];
    }

    const parsed = JSON.parse(result);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    if (typeof parsed === 'string') {
      return [parsed];
    }

    return [];
  } catch {
    return [];
  }
}

function resolveNextDevVersion(args: { packageName: string; baseVersion: string }): string {
  const { packageName, baseVersion } = args;
  const publishedVersions = getPublishedVersions(packageName);

  const devVersionRegex = new RegExp(`^${escapeRegExp(baseVersion)}-dev\\.(\\d+)$`);

  const existingDevNumbers = publishedVersions
    .map((version) => version.match(devVersionRegex)?.[1])
    .filter((value): value is string => Boolean(value))
    .map(Number);

  const nextDevNumber = existingDevNumbers.length === 0 ? 0 : Math.max(...existingDevNumbers) + 1;

  return `${baseVersion}-dev.${nextDevNumber}`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Step 1: Resolve the current GitHub username
const githubUsername = resolveGitHubUsername();
const devName = `@${githubUsername}/video-common`;

console.log(`Publishing as ${devName}...`);

// Step 2: Build
if (fs.existsSync(DIST_PATH)) {
  console.log('Cleaning dist/...');
  fs.rmSync(DIST_PATH, { recursive: true, force: true });
}

console.log('\nBuilding package...');
run({ command: 'npx nx run common:build', cwd: MONOREPO_ROOT });

if (!fs.existsSync(DIST_PACKAGE_JSON_PATH)) {
  console.error('dist/package.json not found. The build may have failed to copy it.');
  process.exit(1);
}

// Step 3: Read manifest for version
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));

if (manifest.version !== packageJson.version) {
  console.error(
    `manifest.json version "${manifest.version}" must match package.json version "${packageJson.version}"`
  );
  process.exit(1);
}

// Step 4: Rewrite dist/package.json name and version for personal dev publish
const distPackageJson = JSON.parse(fs.readFileSync(DIST_PACKAGE_JSON_PATH, 'utf-8'));

const originalName = distPackageJson.name;
const originalVersion = distPackageJson.version;

const devVersion = resolveNextDevVersion({
  packageName: devName,
  baseVersion: manifest.version,
});

distPackageJson.name = devName;
distPackageJson.version = devVersion;

fs.writeFileSync(DIST_PACKAGE_JSON_PATH, JSON.stringify(distPackageJson, null, 2) + '\n');

console.log(`\nRenamed package: ${originalName} → ${devName}`);
console.log(`Dev version: ${originalVersion} → ${devVersion}`);

// Step 5: Publish — restore name and version on success or failure
try {
  console.log(`\nPublishing ${devName}@${devVersion} with tag "${DEV_TAG}"...`);

  run({
    command: `npm publish --tag ${DEV_TAG} --registry ${REGISTRY}`,
    cwd: DIST_PATH,
  });

  console.log('\nPublished successfully.');
} finally {
  distPackageJson.name = originalName;
  distPackageJson.version = originalVersion;

  fs.writeFileSync(DIST_PACKAGE_JSON_PATH, JSON.stringify(distPackageJson, null, 2) + '\n');

  console.log(`\nRestored package name: ${devName} → ${originalName}`);
  console.log(`Restored package version: ${devVersion} → ${originalVersion}`);
}
