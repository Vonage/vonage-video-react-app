#!/usr/bin/env npx tsx

import * as path from 'node:path';
import * as child_process from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MONOREPO_ROOT = path.resolve(__dirname, '..');
const CREDENTIAL_VARIABLE_PATTERN = /(^|:)_(authtoken|auth|password)$/;

const PACKAGE_SCRIPTS_BY_TARGET: Record<string, { versionCheck: string; publish: string }> = {
  common: {
    versionCheck: path.join(MONOREPO_ROOT, 'scripts/commonPackage/checkVersionBump.ts'),
    publish: path.join(MONOREPO_ROOT, 'scripts/commonPackage/publish.ts'),
  },
};

/**
 * Validates a package before publishing: quality checks, version bump against origin/develop, then
 * tests, build and `npm publish --dry-run`.
 * Usage: yarn prepare:package <target>
 * NPM_TOKEN is optional; when set, the dry run also checks the token and the published versions.
 */
function main(): void {
  const [target] = process.argv.slice(2);
  const isKnownTarget = target !== undefined && Object.hasOwn(PACKAGE_SCRIPTS_BY_TARGET, target);

  if (!isKnownTarget) {
    const availableTargets = Object.keys(PACKAGE_SCRIPTS_BY_TARGET).join(', ');
    console.error(
      `Invalid or missing target "${target ?? '(none)'}". Available targets: ${availableTargets}`
    );
    console.error('Usage: yarn prepare:package <target>');
    process.exit(1);
  }

  const packageScripts = PACKAGE_SCRIPTS_BY_TARGET[target];
  const environmentWithoutToken = Object.fromEntries(
    Object.entries(process.env).filter(([name]) => {
      const isTokenVariable = name === 'NPM_TOKEN' || name === 'NODE_AUTH_TOKEN';
      const npmConfigKey = name.toLowerCase().replace(/^npm_config_/, '');
      return !isTokenVariable && !CREDENTIAL_VARIABLE_PATTERN.test(npmConfigKey);
    })
  );
  const run = (args: { command: string; environment?: NodeJS.ProcessEnv }) =>
    child_process.execSync(args.command, {
      cwd: MONOREPO_ROOT,
      stdio: 'inherit',
      env: args.environment ?? environmentWithoutToken,
    });

  console.log(`\n🔍 Quality check: ${target}\n`);
  run({ command: `npx tsx scripts/qualityCheck.ts ${target}` });

  console.log(`\n🔖 Version bump check: ${target}\n`);
  run({ command: 'git fetch --no-tags origin develop' });
  run({ command: `npx tsx "${packageScripts.versionCheck}" origin/develop` });

  console.log(`\n📦 Tests, build and publish dry run: ${target}\n`);
  run({
    command: `npx tsx "${packageScripts.publish}"`,
    environment: { ...process.env, PUBLISH_DRY_RUN: '1' },
  });

  console.log(`\n✅ ${target} is ready to publish.`);
}

main();
