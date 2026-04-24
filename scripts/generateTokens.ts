#!/usr/bin/env tsx
/**
 * Syncs generated theme token artifacts.
 * Run: yarn sync:theme-tokens
 */

import * as fs from 'fs';
import { execSync } from 'child_process';
import * as path from 'path';
// eslint-disable-next-line @nx/enforce-module-boundaries
import tokensToJson from '../libs/ui/src/theme/helpers/designTokens/helpers/tokensToJson';

const scriptsToRun = ['libs/ui/src/theme/helpers/tailwind/generateTailwindPlugin.ts'];
const commandName = 'sync:theme-tokens';

const rootDesignTokensFilePath = path.resolve('designTokens.json');
const pluginDesignTokensFilePath = path.resolve(
  'libs/ui/src/theme/helpers/designTokens/designTokens.json'
);
const generatedPluginFilePath = path.resolve('libs/ui/src/theme/helpers/tailwind/veraUI.cjs');

function syncPluginTokensFromRootOrDefaults(): void {
  console.log('\x1b[36m→ Syncing plugin token source\x1b[0m');

  if (!fs.existsSync(rootDesignTokensFilePath)) {
    console.log(
      '\x1b[36m→ Root designTokens.json not found. Bootstrapping from TS defaults\x1b[0m'
    );

    tokensToJson('.', 'designTokens.json');
    const generatedRootTokens = fs.readFileSync(rootDesignTokensFilePath, 'utf-8');

    fs.writeFileSync(pluginDesignTokensFilePath, generatedRootTokens, 'utf-8');

    console.log(
      `\x1b[32m✔ Root designTokens.json created from defaults at ${rootDesignTokensFilePath}\x1b[0m`
    );

    console.log(
      `\x1b[32m✔ Plugin design tokens synced from root at ${pluginDesignTokensFilePath}\x1b[0m`
    );

    return;
  }

  console.log('\x1b[36m→ Root designTokens.json found. Using it as source of truth\x1b[0m');
  const rootTokens = fs.readFileSync(rootDesignTokensFilePath, 'utf-8');

  fs.writeFileSync(
    pluginDesignTokensFilePath,
    rootTokens.endsWith('\n') ? rootTokens : `${rootTokens}\n`,
    'utf-8'
  );

  console.log(
    `\x1b[32m✔ Plugin design tokens synced from root at ${pluginDesignTokensFilePath}\x1b[0m`
  );
}

/**
 * Syncs design token JSON files and Tailwind plugin.
 * - Always regenerates designTokens.example.json from TS defaults.
 * - Uses root designTokens.json as source of truth when it exists.
 * - Bootstraps root designTokens.json from defaults when it does not exist.
 * - Always rebuilds and formats veraUI.cjs.
 * Exits with error code 1 if any script fails.
 */
const generateTokens = () => {
  console.log(`\x1b[36m🔄 [${commandName}] Starting token sync\x1b[0m\n`);

  try {
    console.log('\x1b[36m→ Generating root example token artifact\x1b[0m');
    tokensToJson('.', 'designTokens.example.json');

    syncPluginTokensFromRootOrDefaults();
  } catch (error) {
    console.error('\x1b[31m✖ Failed to generate design token JSON files\x1b[0m', error);
    process.exit(1);
  }

  for (const script of scriptsToRun) {
    const scriptPath = path.resolve(script);
    try {
      console.log(`\x1b[36m→ Rebuilding Tailwind plugin via ${script}\x1b[0m`);
      execSync(`tsx ${scriptPath}`, { stdio: 'inherit' });
    } catch (error) {
      console.error(`\x1b[31m✖ Failed to run ${script}\x1b[0m`, error);
      process.exit(1);
    }
  }

  try {
    console.log(`\x1b[36m→ Formatting generated plugin file: ${generatedPluginFilePath}\x1b[0m`);
    execSync(`npx prettier --write "${generatedPluginFilePath}"`, { stdio: 'inherit' });
  } catch (error) {
    console.error('\x1b[31m✖ Failed to format generated plugin file\x1b[0m', error);
    process.exit(1);
  }

  console.log(`\n\x1b[32m✔ [${commandName}] Token sync completed successfully\x1b[0m`);
};

/**
 * Main entry point for design token generation.
 */
const main = () => {
  if (process.argv.length > 2) {
    console.log(
      `\x1b[33m⚠ [${commandName}] This command no longer accepts modes/arguments. Running default sync flow.\x1b[0m`
    );
  }

  generateTokens();
};

main();
