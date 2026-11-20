import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import { builtinModules } from 'node:module';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  scanExternalPackages,
  validateChannelFormat,
  validateVersionSync,
} from '../../libs/common/scripts/helpers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MONOREPO_ROOT = path.resolve(__dirname, '../..');
const COMMON_ROOT = path.join(MONOREPO_ROOT, 'libs/common');
const NODE_MODULES_DIRECTORY = path.join(MONOREPO_ROOT, 'node_modules');
const MANIFEST_PATH = path.join(COMMON_ROOT, 'manifest.json');

const SOURCE_GROUPS = [
  { sourceRoot: 'src', alias: '@common' },
  { sourceRoot: 'web', alias: '@web' },
  { sourceRoot: 'node', alias: '@node' },
  { sourceRoot: 'test', alias: '@common-test' },
  { sourceRoot: 'web-test', alias: '@web-test' },
  { sourceRoot: 'node-test', alias: '@node-test' },
];

const BUILD_INPUT_FILES = [
  'LICENSE',
  'tsconfig.base.json',
  'libs/common/README.md',
  'libs/common/tsconfig.json',
  'libs/common/tsconfig.lib.json',
  'libs/common/vite.config.ts',
  'libs/common/scripts/helpers/scanExternalPackages.ts',
];

const OPTIONAL_IMPORTS = ['@jest/globals'];

const BUILD_TOOLCHAIN = [
  { packageName: 'vite', requiredBy: null },
  { packageName: 'rollup', requiredBy: 'vite' },
  { packageName: 'esbuild', requiredBy: 'vite' },
  { packageName: 'terser', requiredBy: null },
  { packageName: '@vitejs/plugin-react-swc', requiredBy: null },
  { packageName: '@swc/core', requiredBy: '@vitejs/plugin-react-swc' },
  { packageName: 'vite-plugin-dts', requiredBy: null },
  { packageName: 'typescript', requiredBy: 'vite-plugin-dts' },
];

const VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)(?:-beta\.(\d+))?$/;

const USAGE =
  'Usage: npx tsx scripts/commonPackage/hash.ts <check|update|version <patch|minor|major|beta|X.Y.Z [--latest|--beta]|X.Y.Z-beta.N>>';

type CommonManifest = { packageName: string; version: string; channel: string; hash: string };

/**
 * Usage: npx tsx scripts/commonPackage/hash.ts <check|update|version <bump>>
 */
function main(): void {
  const [mode, ...modeArguments] = process.argv.slice(2);

  if (mode === 'check') {
    const { hash } = verifyPackageHash();
    console.log(`\n✅ @vonage/video-reference-apps-common hash verified: ${hash}\n`);
    return;
  }

  if (mode === 'version') {
    const [versionBump, channelFlag, ...extraArguments] = modeArguments.map((argument) =>
      argument.replace(/^--/, '')
    );
    const isChannelFlagValid =
      channelFlag === undefined || channelFlag === 'latest' || channelFlag === 'beta';
    const isValidCall =
      versionBump !== undefined && isChannelFlagValid && extraArguments.length === 0;

    if (!isValidCall) {
      console.error(USAGE);
      process.exit(1);
    }

    setVersion({ versionBump, channelFlag: channelFlag ?? null });
    return;
  }

  if (mode !== 'update') {
    console.error(USAGE);
    process.exit(1);
  }

  const { version, channel, hash: oldHash } = readManifest();
  const newHash = computePackageHash();

  console.log(`Old hash: ${oldHash || '(empty)'}`);
  console.log(`New hash: ${newHash}`);
  fs.writeFileSync(
    MANIFEST_PATH,
    JSON.stringify({ version, channel, hash: newHash }, null, 2) + '\n'
  );
  console.log('manifest.json updated. Commit manifest.json.');
  console.log(
    '\nReminder: ensure your branch is up-to-date with the target branch before running this script,'
  );
  console.log(
    'CI could fail if the target branch has newer libs/common changes that are not in your branch yet.'
  );
}

export function verifyPackageHash(): CommonManifest {
  const manifest = readManifest();
  const computedHash = computePackageHash();

  if (computedHash === manifest.hash) return manifest;

  console.error('\n❌ @vonage/video-reference-apps-common hash check failed\n');
  console.error('   The libs/common build inputs do not match the committed manifest hash.');
  console.error(
    '   The hash covers the source files, package.json (except "version"), the build configuration'
  );
  console.error('   and the installed versions of the external packages and build tools.\n');
  console.error(`   Expected (manifest.json): ${manifest.hash || '(empty — never computed)'}`);
  console.error(`   Actual   (build inputs):  ${computedHash}\n`);
  console.error('   If you changed libs/common or its dependencies:\n');
  console.error(
    '     1. Ensure your branch is up-to-date with the target branch (e.g. git merge origin/develop)'
  );
  console.error('     2. Run: pnpm common:hash:update');
  console.error('     3. Commit the updated manifest.json.\n');
  console.error(
    '   If you did not change libs/common, your node_modules may be stale. Run: pnpm install\n'
  );
  process.exit(1);
}

function setVersion(args: { versionBump: string; channelFlag: 'latest' | 'beta' | null }): void {
  const { versionBump, channelFlag } = args;
  const { version } = readManifest();
  const nextVersion = channelFlag
    ? computeChannelVersion({ version, releaseVersion: versionBump, channelFlag })
    : computeNextVersion({ version, versionBump });
  const channel = nextVersion.includes('-beta.') ? 'beta' : 'latest';
  const packageJsonPath = path.join(COMMON_ROOT, 'package.json');
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  fs.writeFileSync(
    MANIFEST_PATH,
    JSON.stringify({ ...manifest, version: nextVersion, channel }, null, 2) + '\n'
  );
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify({ ...packageJson, version: nextVersion }, null, 2) + '\n'
  );

  console.log(`libs/common version: ${version} → ${nextVersion} (${channel})`);
  console.log('Commit libs/common/package.json and libs/common/manifest.json.');
}

function computeChannelVersion(args: {
  version: string;
  releaseVersion: string;
  channelFlag: 'latest' | 'beta';
}): string {
  const { version, releaseVersion, channelFlag } = args;
  const isReleaseVersion = /^\d+\.\d+\.\d+$/.test(releaseVersion);

  if (!isReleaseVersion) {
    console.error(
      `With --${channelFlag}, pass a release version like 0.1.0 (got "${releaseVersion}").`
    );
    process.exit(1);
  }

  if (channelFlag === 'latest') return releaseVersion;

  const betaPrefix = `${releaseVersion}-beta.`;
  const nextBetaNumber = version.startsWith(betaPrefix)
    ? Number(version.slice(betaPrefix.length)) + 1
    : 0;

  return `${betaPrefix}${nextBetaNumber}`;
}

function computeNextVersion(args: { version: string; versionBump: string }): string {
  const { version, versionBump } = args;
  const isExactVersion = VERSION_PATTERN.test(versionBump);

  if (isExactVersion) return versionBump;

  const [, majorText, minorText, patchText, betaText] = VERSION_PATTERN.exec(version) ?? [];
  const major = Number(majorText);
  const minor = Number(minorText);
  const patch = Number(patchText);
  const isBeta = betaText !== undefined;

  if (versionBump === 'beta') {
    return isBeta
      ? `${major}.${minor}.${patch}-beta.${Number(betaText) + 1}`
      : `${major}.${minor}.${patch + 1}-beta.0`;
  }

  if (versionBump === 'patch') {
    return isBeta ? `${major}.${minor}.${patch}` : `${major}.${minor}.${patch + 1}`;
  }

  if (versionBump === 'minor') {
    const isMinorBeta = isBeta && patch === 0;
    return isMinorBeta ? `${major}.${minor}.0` : `${major}.${minor + 1}.0`;
  }

  if (versionBump === 'major') {
    const isMajorBeta = isBeta && minor === 0 && patch === 0;
    return isMajorBeta ? `${major}.0.0` : `${major + 1}.0.0`;
  }

  console.error(USAGE);
  process.exit(1);
}

function readManifest(): CommonManifest {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const packageJson = JSON.parse(fs.readFileSync(path.join(COMMON_ROOT, 'package.json'), 'utf-8'));

  validateVersionSync({ manifestVersion: manifest.version, packageVersion: packageJson.version });
  validateChannelFormat({ version: manifest.version, channel: manifest.channel });

  return {
    packageName: packageJson.name,
    version: manifest.version,
    channel: manifest.channel,
    hash: manifest.hash,
  };
}

function computePackageHash(): string {
  const sourceFiles = SOURCE_GROUPS.flatMap(({ sourceRoot }) =>
    listTypeScriptFiles(path.join(COMMON_ROOT, sourceRoot))
  );
  const fileEntries = [
    ...sourceFiles,
    ...BUILD_INPUT_FILES.map((relativePath) => path.join(MONOREPO_ROOT, relativePath)),
  ].map((filePath) => ({
    key: path.relative(MONOREPO_ROOT, filePath).replaceAll(path.sep, '/'),
    content: fs.readFileSync(filePath),
  }));

  const packageJson = JSON.parse(fs.readFileSync(path.join(COMMON_ROOT, 'package.json'), 'utf-8'));
  delete packageJson.version;

  const projectJson = JSON.parse(fs.readFileSync(path.join(COMMON_ROOT, 'project.json'), 'utf-8'));

  const externalPackages = scanExternalPackages({
    sourceRoots: SOURCE_GROUPS.map(({ sourceRoot }) => path.resolve(COMMON_ROOT, sourceRoot)),
    internalAliases: SOURCE_GROUPS.map(({ alias }) => alias),
  });
  const externalPackageVersions = [...externalPackages]
    .sort()
    .filter((packageName) => packageName.startsWith('@') || !packageName.includes('/'))
    .flatMap((packageName) => {
      const version = readInstalledVersion(path.join(NODE_MODULES_DIRECTORY, packageName));
      if (version) return [`${packageName}@${version}`];
      if (builtinModules.includes(packageName)) return [];
      if (OPTIONAL_IMPORTS.includes(packageName)) return [`${packageName}@not-installed`];
      return exitWithMissingPackage(packageName);
    });

  const buildToolchainVersions = BUILD_TOOLCHAIN.map(({ packageName, requiredBy }) => {
    const packageDirectories = [
      ...(requiredBy ? [path.join(NODE_MODULES_DIRECTORY, requiredBy, 'node_modules')] : []),
      NODE_MODULES_DIRECTORY,
    ].map((directory) => path.join(directory, packageName));
    const version = packageDirectories.map(readInstalledVersion).find(Boolean);
    if (!version) return exitWithMissingPackage(packageName);
    return `${packageName}@${version}`;
  }).sort();

  const entries = [
    ...fileEntries,
    { key: 'libs/common/package.json', content: JSON.stringify(packageJson) },
    {
      key: 'libs/common/project.json#targets.build',
      content: JSON.stringify(projectJson.targets.build),
    },
    { key: 'external-package-versions', content: externalPackageVersions.join('\n') },
    { key: 'build-toolchain-versions', content: buildToolchainVersions.join('\n') },
  ];

  const hash = crypto.createHash('sha256');

  for (const { key, content } of entries.sort((left, right) => (left.key < right.key ? -1 : 1))) {
    hash.update(key);
    hash.update('\0');
    hash.update(content);
    hash.update('\0');
  }

  return hash.digest('hex');
}

function listTypeScriptFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listTypeScriptFiles(fullPath);
    if (/\.(ts|tsx)$/.test(entry.name)) return [fullPath];
    return [];
  });
}

function readInstalledVersion(packageDirectory: string): string | null {
  const packageJsonPath = path.join(packageDirectory, 'package.json');
  if (!fs.existsSync(packageJsonPath)) return null;
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as { version?: string };
  return packageJson.version ?? null;
}

function exitWithMissingPackage(packageName: string): never {
  console.error(
    `\n❌ ${packageName} is not installed in node_modules, so the libs/common hash cannot be computed.`
  );
  console.error('   Run: pnpm install\n');
  process.exit(1);
}

const isRunDirectly =
  process.argv[1] !== undefined && fs.realpathSync(process.argv[1]) === fs.realpathSync(__filename);

if (isRunDirectly) {
  main();
}
