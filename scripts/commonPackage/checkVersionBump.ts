import * as child_process from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MONOREPO_ROOT = path.resolve(__dirname, '../..');
const MANIFEST_REPOSITORY_PATH = 'libs/common/manifest.json';

type Manifest = { version: string; channel: string; hash: string };

/**
 * Usage: npx tsx scripts/commonPackage/checkVersionBump.ts [baseRef]   (default: BASE_REF or origin/develop)
 */
function main(): void {
  const baseRef = process.argv[2] ?? process.env.BASE_REF ?? 'origin/develop';
  const manifest: Manifest = JSON.parse(
    fs.readFileSync(path.join(MONOREPO_ROOT, MANIFEST_REPOSITORY_PATH), 'utf-8')
  );

  const runGit = (gitArguments: string[]) =>
    child_process.spawnSync('git', gitArguments, { cwd: MONOREPO_ROOT, encoding: 'utf-8' });

  const isBaseRefAvailable =
    runGit(['rev-parse', '--verify', '--quiet', `${baseRef}^{commit}`]).status === 0;

  if (!isBaseRefAvailable) {
    console.error(
      `❌ Base ref "${baseRef}" not found. Fetch it first, e.g. git fetch origin develop`
    );
    process.exit(1);
  }

  const baseManifestResult = runGit(['show', `${baseRef}:${MANIFEST_REPOSITORY_PATH}`]);

  if (baseManifestResult.status !== 0) {
    console.log(`✅ ${MANIFEST_REPOSITORY_PATH} does not exist on ${baseRef}. Nothing to compare.`);
    return;
  }

  const baseManifest: Manifest = JSON.parse(baseManifestResult.stdout);

  if (manifest.hash === baseManifest.hash) {
    console.log(`✅ libs/common hash is unchanged against ${baseRef}. No version bump needed.`);
    return;
  }

  const versionParts = parseVersion(manifest.version);
  const baseVersionParts = parseVersion(baseManifest.version);
  const firstVersionDifference = versionParts
    .map((part, index) => part - baseVersionParts[index])
    .find((difference) => difference !== 0);
  const isVersionRaised = (firstVersionDifference ?? 0) > 0;

  if (isVersionRaised) {
    console.log(
      `✅ libs/common hash changed and version was raised: ${baseManifest.version} → ${manifest.version} (${manifest.channel}).`
    );
    return;
  }

  console.error('\n❌ libs/common hash changed but the version was not raised.\n');
  console.error(
    '   The hash covers the source, package.json, the build configuration and the installed'
  );
  console.error('   versions of the external packages and build tools.\n');
  console.error(`   ${baseRef}: ${baseManifest.version}`);
  console.error(`   this branch: ${manifest.version}\n`);
  console.error('   Decide the release and run one of:');
  console.error('     pnpm nx run common:version -- patch|minor|major|beta');
  console.error('     pnpm nx run common:version -- X.Y.Z   (or X.Y.Z-beta.N)\n');
  process.exit(1);
}

function parseVersion(version: string): number[] {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-beta\.(\d+))?$/.exec(version);

  if (!match) {
    console.error(`Unsupported version "${version}". Expected e.g. "1.2.0" or "1.2.0-beta.0".`);
    process.exit(1);
  }

  const [, major, minor, patch, beta] = match;

  return [
    Number(major),
    Number(minor),
    Number(patch),
    beta === undefined ? Number.MAX_SAFE_INTEGER : Number(beta),
  ];
}

main();
