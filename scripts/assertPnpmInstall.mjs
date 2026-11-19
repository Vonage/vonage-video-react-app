import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { join } from 'node:path';

const PNPM_VERSION = '12.11.2';

const repositoryRoot = process.cwd();
const pnpmLockPath = join(repositoryRoot, 'pnpm-lock.yaml');
const nodeModulesPath = join(repositoryRoot, 'node_modules');
const pnpmMarkerPath = join(nodeModulesPath, '.pnpm');

await main();

async function main() {
  if (!existsSync(pnpmLockPath)) {
    process.exit(0);
  }

  const hasNodeModules = existsSync(nodeModulesPath);

  if (hasNodeModules && existsSync(pnpmMarkerPath)) {
    process.exit(0);
  }

  process.stderr.write(hasNodeModules ? staleTreeNotice() : missingTreeNotice());

  const canPrompt = process.stdin.isTTY && process.stdout.isTTY;

  if (!canPrompt) {
    process.exit(1);
  }

  if (!isPnpmAvailable()) {
    process.stderr.write(installPnpmNotice());
    process.exit(1);
  }

  const answer = await ask('  Install with pnpm now? [Y/n] ');
  const declined = answer.trim().toLowerCase().startsWith('n');

  if (declined) {
    process.stderr.write('\n  Nothing installed. Run `pnpm install` when ready.\n\n');
    process.exit(1);
  }

  const install = spawnSync('pnpm', ['install'], { stdio: 'inherit' });

  process.exit(install.status ?? 1);
}

function staleTreeNotice() {
  return [
    '',
    '⚠  This project now uses pnpm to install dependencies.',
    '',
    '  Your node_modules was installed by yarn or npm, so it no longer matches',
    '  pnpm-lock.yaml, which is now the only lockfile in the repository.',
    '',
    '  Running scripts with yarn keeps working, `yarn dev` and the rest are unchanged.',
    '  Only installing moved to pnpm.',
    '',
  ].join('\n');
}

function missingTreeNotice() {
  return [
    '',
    '⚠  Dependencies are not installed.',
    '',
    '  This project installs with pnpm, and pnpm-lock.yaml is the only lockfile.',
    '  Running scripts with yarn keeps working once the install is done.',
    '',
  ].join('\n');
}

function installPnpmNotice() {
  return [
    '  pnpm was not found on your PATH. This repository needs pnpm 12 or newer:',
    '',
    `    npm i -g pnpm@${PNPM_VERSION}`,
    '',
    '  Then run: pnpm install',
    '',
  ].join('\n');
}

function isPnpmAvailable() {
  return spawnSync('pnpm', ['--version'], { stdio: 'ignore' }).status === 0;
}

async function ask(question) {
  const readline = createInterface({ input: process.stdin, output: process.stdout });

  const answer = await readline.question(question);
  readline.close();

  return answer;
}
