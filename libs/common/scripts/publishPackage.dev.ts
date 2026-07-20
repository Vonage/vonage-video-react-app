/**
 * Builds and publishes video-common as a personal dev package to GitHub Packages.
 *
 * Usage:
 *   GH_TOKEN=<token> npx tsx scripts/publishPackage.dev.ts   (recommended)
 *   npx tsx scripts/publishPackage.dev.ts <token>            (discouraged, visible in shell history/process list)
 *
 * Flow:
 * - Reads the GitHub token from the GH_TOKEN env var, or a CLI argument as fallback
 * - Resolves the current GitHub user from the token and target package scope: @<user>/video-common
 * - Computes the next available <base>-dev.N version from registry
 * - Publishes that version once with the "dev" dist-tag
 * - Persists the published version to manifest.json and package.json
 */
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
const GITHUB_API_BASE_URL = 'https://api.github.com';
const GITHUB_API_VERSION = '2022-11-28';
const GITHUB_PACKAGES_PAGE_SIZE = 100;

function getProcessEnvironmentWithoutNodeOptions(): NodeJS.ProcessEnv {
  const environment = { ...process.env };

  delete environment.NODE_OPTIONS;

  return environment;
}

function run(args: { command: string; cwd: string }): void {
  const { command, cwd } = args;

  console.log(`\n> ${command}`);
  child_process.execSync(command, { cwd, stdio: 'inherit' });
}

function execWithStatus(args: { command: string; cwd: string }): {
  exitCode: number;
  stdout: string;
  stderr: string;
} {
  const { command, cwd } = args;

  const commandResult = child_process.spawnSync(command, {
    cwd,
    env: getProcessEnvironmentWithoutNodeOptions(),
    encoding: 'utf-8',
    shell: true,
  });

  return {
    exitCode: commandResult.status ?? 1,
    stdout: commandResult.stdout ?? '',
    stderr: commandResult.stderr ?? '',
  };
}

function resolveToken(): string {
  const tokenFromEnv = process.env.GH_TOKEN;

  if (tokenFromEnv) {
    return tokenFromEnv;
  }

  const tokenFromArgs = process.argv[2];

  if (!tokenFromArgs) {
    console.error('Missing GitHub token.');
    console.error('Usage: GH_TOKEN=<token> npx tsx scripts/publishPackage.dev.ts');
    process.exit(1);
  }

  return tokenFromArgs;
}

async function resolveGitHubUsernameFromToken(token: string): Promise<string> {
  const response = await requestGitHubApi({ endpoint: '/user', token });

  if (!response.ok) {
    const responseBody = await response.text();

    console.error('Failed to resolve GitHub user from token.');
    console.error(`GitHub API ${response.status} ${response.statusText}: ${responseBody}`);
    process.exit(1);
  }

  const user = (await response.json()) as { login?: string };

  if (!user.login) {
    console.error('GitHub API response did not include a login field.');
    process.exit(1);
  }

  return user.login;
}

async function requestGitHubApi(args: { endpoint: string; token: string }): Promise<Response> {
  const { endpoint, token } = args;

  return fetch(`${GITHUB_API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': GITHUB_API_VERSION,
      'User-Agent': 'video-common-dev-publisher',
      Connection: 'close',
    },
  });
}

async function getPublishedVersions(args: {
  owner: string;
  packageName: string;
  token: string;
}): Promise<string[]> {
  const { packageName, token } = args;
  // GitHub API expects the unscoped package name (e.g. "video-common", not "@user/video-common")
  const unscopedName = packageName.includes('/') ? packageName.split('/')[1] : packageName;
  const encodedPackageName = encodeURIComponent(unscopedName);
  const versions: string[] = [];
  let page = 1;

  while (true) {
    // Use the authenticated-user endpoint (not /users/{owner}/...), since the
    // latter only lists publicly-visible packages and silently 404s for a
    // package that defaults to private visibility on GitHub Packages.
    const endpoint = `/user/packages/npm/${encodedPackageName}/versions?per_page=${GITHUB_PACKAGES_PAGE_SIZE}&page=${page}`;
    const response = await requestGitHubApi({ endpoint, token });

    if (response.status === 404) {
      return [];
    }

    if (!response.ok) {
      const responseBody = await response.text();

      console.error(`Failed to fetch published versions for ${packageName}.`);
      console.error(`GitHub API ${response.status} ${response.statusText}: ${responseBody}`);
      process.exit(1);
    }

    const responseVersions = (await response.json()) as Array<{ name?: string }>;

    for (const responseVersion of responseVersions) {
      if (responseVersion.name) {
        versions.push(responseVersion.name);
      }
    }

    if (responseVersions.length < GITHUB_PACKAGES_PAGE_SIZE) {
      break;
    }

    page += 1;
  }

  return versions;
}

function resolveBaseVersion(version: string): string {
  const [baseVersion] = version.split('-dev.');

  return baseVersion;
}

async function resolveNextDevVersion(args: {
  owner: string;
  packageName: string;
  currentVersion: string;
  token: string;
}): Promise<string> {
  const { owner, packageName, currentVersion, token } = args;
  const baseVersion = resolveBaseVersion(currentVersion);
  const publishedVersions = await getPublishedVersions({ owner, packageName, token });

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

function persistResolvedDevVersion(args: {
  packageJson: Record<string, unknown>;
  manifest: Record<string, unknown>;
  devVersion: string;
}): void {
  const { packageJson, manifest, devVersion } = args;

  packageJson.version = devVersion;
  manifest.version = devVersion;

  fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2) + '\n');
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
}

async function main(): Promise<void> {
  // Step 1: Resolve token and current GitHub username
  const token = resolveToken();
  const githubUsername = await resolveGitHubUsernameFromToken(token);
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

  const devVersion = await resolveNextDevVersion({
    owner: githubUsername,
    packageName: devName,
    currentVersion: manifest.version,
    token,
  });

  distPackageJson.name = devName;
  distPackageJson.version = devVersion;

  fs.writeFileSync(DIST_PACKAGE_JSON_PATH, JSON.stringify(distPackageJson, null, 2) + '\n');

  console.log(`\nUsing package name: ${devName}`);
  console.log(`Using dev version: ${devVersion}`);

  // Step 5: Publish once using the computed remote-safe version
  console.log(`\nPublishing ${devName}@${devVersion} with tag "${DEV_TAG}"...`);

  const publishCommand = [
    'npm publish',
    `--tag ${DEV_TAG}`,
    `--registry ${REGISTRY}`,
    `--//npm.pkg.github.com/:_authToken=${token}`,
  ].join(' ');

  const publishResult = execWithStatus({
    command: publishCommand,
    cwd: DIST_PATH,
  });

  if (publishResult.stdout.trim()) {
    process.stdout.write(publishResult.stdout);
  }

  if (publishResult.stderr.trim()) {
    process.stderr.write(publishResult.stderr);
  }

  if (publishResult.exitCode !== 0) {
    throw new Error(`npm publish failed with exit code ${publishResult.exitCode}`);
  }

  console.log('\nPublished successfully.');

  persistResolvedDevVersion({
    packageJson,
    manifest,
    devVersion,
  });

  console.log(`Persisted version ${devVersion} to package.json and manifest.json.`);
}

await main();
