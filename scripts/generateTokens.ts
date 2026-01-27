#!/usr/bin/env tsx
/**
 * Generates all JSON files from design tokens
 * Run: npm run generate:tokens
 * Run with watch: npm run generate:tokens watch
 */

import { watch } from 'fs';
import { execSync } from 'child_process';
import * as path from 'path';

const scriptsToRun = [
  'libs/ui/src/theme/helpers/designTokens/helpers/tokensToJson.ts',
  'libs/ui/src/theme/helpers/tailwind/generateTailwindPlugin.ts',
];

/**
 * Generates all design token JSON files and Tailwind plugin.
 * Runs tokensToJson.ts and generateTailwindPlugin.ts in sequence.
 * Exits with error code 1 if any script fails.
 */
const generateTokens = () => {
  console.log('\x1b[36m🔄 Generating design tokens...\x1b[0m\n');

  for (const script of scriptsToRun) {
    const scriptPath = path.resolve(script);
    try {
      execSync(`tsx ${scriptPath}`, { stdio: 'inherit' });
    } catch (error) {
      console.error(`\x1b[31m✖ Failed to run ${script}\x1b[0m`, error);
      process.exit(1);
    }
  }

  console.log('\n\x1b[32m✔ All design tokens generated successfully!\x1b[0m');
};

/**
 * Watches the design tokens directory for changes and regenerates on change.
 * Runs generation once on start, then watches for .ts file changes (excluding tokensToJson.ts).
 */
const runWatch = () => {
  const tokensDir = path.resolve('libs/ui/src/theme/helpers/designTokens');

  console.log('\x1b[36m👀 Watching design tokens for changes...\x1b[0m\n');

  // Run once on start
  generateTokens();

  // Watch for changes
  watch(tokensDir, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.ts') && !filename.includes('helpers/tokensToJson')) {
      console.log(`\n\x1b[33m📝 Detected change in ${filename}\x1b[0m`);
      try {
        generateTokens();
      } catch (error) {
        console.error('\x1b[31m✖ Generation failed\x1b[0m', error);
      }
    }
  });
};

/**
 * Main entry point for design token generation.
 *
 * Modes:
 * - No args: Generate tokens once
 * - watch/--watch: Watch for changes and regenerate
 *
 * Usage:
 * - yarn generate:tokens         (generate once)
 * - yarn generate:tokens watch   (watch mode)
 */
const main = () => {
  const args = process.argv.slice(2);
  const [firstArg] = args;

  const isWatchMode = firstArg === 'watch' || firstArg === '--watch';

  if (isWatchMode) {
    runWatch();
    return;
  }

  generateTokens();
};

main();
