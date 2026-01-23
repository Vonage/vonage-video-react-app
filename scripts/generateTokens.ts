#!/usr/bin/env tsx
/**
 * Generates all JSON files from design tokens
 * Run: npm run generate:tokens
 */

import { execSync } from 'child_process';
import * as path from 'path';

const scriptsToRun = [
  'libs/ui/src/theme/helpers/designTokens/helpers/tokensToJson.ts',
  'libs/ui/src/theme/helpers/tailwind/generateTailwindExtends.ts',
];

console.log('\x1b[36m🔄 Generating design tokens...\x1b[0m\n');

for (const script of scriptsToRun) {
  const scriptPath = path.resolve(script);
  try {
    execSync(`tsx ${scriptPath}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`\x1b[31m✖ Failed to run ${script}\x1b[0m`);
    process.exit(1);
  }
}

console.log('\n\x1b[32m✔ All design tokens generated successfully!\x1b[0m');
