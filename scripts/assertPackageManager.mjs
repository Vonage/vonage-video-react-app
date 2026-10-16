const PNPM_VERSION = '12.11.2';
const MINIMUM_PNPM_MAJOR = 12;

const userAgent = process.env.npm_config_user_agent ?? '';

if (userAgent.startsWith('pnpm')) {
  assertSupportedPnpmVersion();
  process.exit(0);
}

function assertSupportedPnpmVersion() {
  const [, version = ''] = /^pnpm\/(\S+)/.exec(userAgent) ?? [];
  const major = Number.parseInt(version, 10);

  if (!Number.isInteger(major) || major >= MINIMUM_PNPM_MAJOR) return;

  process.stderr.write(
    [
      '',
      `✖ pnpm ${version} is too old for this repository.`,
      '',
      `  pnpm below ${MINIMUM_PNPM_MAJOR} does not set the executable bit on package binaries,`,
      '  which breaks running scripts with yarn: `yarn prettier` and `yarn quality-check`',
      '  fail with "Permission denied".',
      '',
      `  Install pnpm ${PNPM_VERSION} or newer:`,
      '',
      `    npm i -g pnpm@${PNPM_VERSION}`,
      '',
      '  corepack ships an older pnpm, so prefer the command above over `corepack enable`.',
      '',
      '',
    ].join('\n')
  );

  process.exit(1);
}

const detectedPackageManager = userAgent.split('/')[0] || 'an unrecognised package manager';

process.stderr.write(
  [
    '',
    `✖ Dependencies cannot be installed with ${detectedPackageManager}.`,
    '',
    '  This repository installs dependencies with pnpm only, and pnpm-lock.yaml is the',
    '  single lockfile. A second lockfile would drift from it, so there is no dual-install mode.',
    '',
    '  Run this instead:',
    '',
    '    pnpm install',
    '',
    `  Do not have pnpm yet? This repository needs ${MINIMUM_PNPM_MAJOR} or newer:`,
    '',
    `    npm i -g pnpm@${PNPM_VERSION}`,
    '',
    '  Want to keep using yarn? You still can, for running scripts.',
    '',
    '  Only installing is pnpm-only. Once dependencies are installed with pnpm, yarn works as a',
    '  task runner exactly as before, so `yarn dev`, `yarn test:frontend` and `yarn nx ...` all',
    '  behave normally. There is nothing else to change in your workflow.',
    '',
    '  Need the whole project back on yarn? There is a script for that:',
    '',
    '    yarn migrate:yarn          (prints what it will do)',
    '    yarn migrate:yarn --yes    (applies it)',
    '',
    '  If a corepack-managed yarn shim refuses to run because packageManager is set to pnpm,',
    '  run the script with pnpm instead (for example `pnpm dev`), or use a globally installed',
    '  classic yarn.',
    '',
    '  Setup guide: README.md → SDK Compatibility & Requirements',
    '',
    '',
  ].join('\n')
);

process.exit(1);
