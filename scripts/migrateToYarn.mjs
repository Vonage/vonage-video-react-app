import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const REPOSITORY_NAME = 'vonage-video-react-app';
const YARN_PACKAGE_MANAGER = 'yarn@1.22.22';
const YARN_ENGINES = { node: '^22.13.0 || >=24', npm: '9.x' };
const FILES_TO_REVERT_MANUALLY = [
  '.github/workflows',
  '.husky/pre-commit',
  '.husky/pre-push',
  'vcrBuild.sh',
];

const repositoryRoot = process.cwd();
const packageJsonPath = join(repositoryRoot, 'package.json');
const pnpmLockPath = join(repositoryRoot, 'pnpm-lock.yaml');
const pnpmWorkspacePath = join(repositoryRoot, 'pnpm-workspace.yaml');

main();

function main() {
  if (!isRepositoryRoot()) {
    fail(`Run this from the ${REPOSITORY_NAME} repository root.`);
  }

  if (!existsSync(pnpmLockPath) && !existsSync(pnpmWorkspacePath)) {
    process.stdout.write('This repository is already configured for yarn. Nothing to do.\n');
    return;
  }

  if (!process.argv.includes('--yes')) {
    printPlan();
    fail('Re-run with --yes to apply.');
  }

  writeJson({ path: packageJsonPath, value: toYarnPackageJson(readJson(packageJsonPath)) });

  removeIfPresent(pnpmLockPath);
  removeIfPresent(pnpmWorkspacePath);
  removeIfPresent(join(repositoryRoot, 'node_modules'));

  process.stdout.write('\nInstalling with yarn, which will generate a fresh yarn.lock.\n\n');

  const install = spawnSync('yarn', ['install'], { stdio: 'inherit' });

  if (install.status !== 0) {
    fail(
      'yarn install failed. package.json is already converted, so fix the error and re-run yarn install.'
    );
  }

  printFollowUp();
}

function isRepositoryRoot() {
  if (!existsSync(packageJsonPath)) return false;
  return readJson(packageJsonPath).name === REPOSITORY_NAME;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson({ path, value }) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function toYarnPackageJson(packageJson) {
  const { preinstall, ...scripts } = packageJson.scripts ?? {};

  return {
    ...packageJson,
    engines: YARN_ENGINES,
    scripts,
    packageManager: YARN_PACKAGE_MANAGER,
  };
}

function removeIfPresent(path) {
  if (!existsSync(path)) return;
  rmSync(path, { recursive: true, force: true });
  const relativePath = path.replace(`${repositoryRoot}/`, '');

  process.stdout.write(`Removed ${relativePath}\n`);
}

function printPlan() {
  process.stdout.write(
    [
      '',
      'This will convert the repository back to yarn:',
      '',
      `  • set packageManager to ${YARN_PACKAGE_MANAGER} and the engines field back to npm`,
      '  • remove the preinstall package manager guard',
      '  • delete pnpm-lock.yaml, pnpm-workspace.yaml and node_modules',
      '  • run yarn install, generating a fresh yarn.lock',
      '',
      'The resolutions in package.json already work with yarn, so they are left untouched.',
      '',
      'The generated yarn.lock will not match the pnpm versions exactly. Yarn re-resolves,',
      'so transitive dependencies can shift. Direct dependencies are almost all pinned.',
      '',
    ].join('\n')
  );
}

function printFollowUp() {
  const remainingFiles = FILES_TO_REVERT_MANUALLY.filter((path) =>
    existsSync(join(repositoryRoot, path))
  );

  process.stdout.write(
    [
      '',
      'Done. Dependencies are installed with yarn and yarn.lock has been generated.',
      '',
      'Still referencing pnpm, and not changed by this script:',
      '',
      ...remainingFiles.map((path) => `  • ${path}`),
      '',
      'Those run installs in CI, the git hooks and the VCR build. Revert them from git history,',
      'for example: git log --oneline -- .github/workflows, then git checkout <commit> -- <path>.',
      '',
      'Then commit yarn.lock and remove scripts/assertPackageManager.mjs.',
      '',
    ].join('\n')
  );
}

function fail(message) {
  process.stderr.write(`\n${message}\n\n`);
  process.exit(1);
}
