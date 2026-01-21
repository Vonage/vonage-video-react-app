#!/usr/bin/env tsx
/**
 * Watches design tokens and regenerates JSON files on change
 * Run: npm run generate:tokens:watch
 */

import { watch } from 'fs';
import { execSync } from 'child_process';
import * as path from 'path';

const tokensDir = path.resolve('libs/ui/src/theme/helpers/designTokens');
const generateScript = path.resolve('scripts/generateTokens.ts');

console.log('\x1b[36m👀 Watching design tokens for changes...\x1b[0m\n');

// Run once on start
execSync(`tsx ${generateScript}`, { stdio: 'inherit' });

// Watch for changes
watch(tokensDir, { recursive: true }, (eventType, filename) => {
  if (filename && filename.endsWith('.ts') && !filename.includes('helpers/tokensToJson')) {
    console.log(`\n\x1b[33m📝 Detected change in ${filename}\x1b[0m`);
    try {
      execSync(`tsx ${generateScript}`, { stdio: 'inherit' });
    } catch (error) {
      console.error('\x1b[31m✖ Generation failed\x1b[0m', error);
    }
  }
});
