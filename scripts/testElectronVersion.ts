#!/usr/bin/env npx tsx
/**
 * Test the app with a different Electron version.
 *
 * Usage:
 *   yarn test:electron-version 41.0.3     # specific version
 *   yarn test:electron-version latest      # latest stable
 *   yarn test:electron-version beta        # latest beta
 *   yarn test:electron-version alpha       # latest alpha
 *   yarn test:electron-version nightly     # latest nightly
 *
 * What it does:
 *   1. Records the current Electron version
 *   2. Installs the requested version
 *   3. Resets macOS Screen Recording permission (TCC) for the new binary
 *   4. Runs TypeScript check to verify compilation
 *   5. Launches the app for manual testing
 *   6. Restores the original Electron version on exit
 */

import { execSync, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const requestedVersion = process.argv[2];

if (!requestedVersion || requestedVersion === '--help' || requestedVersion === '-h') {
  console.log(`
Usage: yarn test:electron-version <version>

Arguments:
  <version>   Electron version to test. Examples:
              41.0.3    — specific version
              latest    — latest stable release
              beta      — latest beta channel
              alpha     — latest alpha channel
              nightly   — latest nightly build

What happens:
  1. Saves current Electron version
  2. Installs the requested version
  3. Resets macOS Screen Recording permission (new binary needs re-grant)
  4. Runs TypeScript check against new Electron types
  5. Launches the app for manual testing
  6. Restores original version when you quit the app

Example:
  yarn test:electron-version 41.0.3
  yarn test:electron-version beta
`);
  process.exit(0);
}

function run(command: string, label: string): void {
  console.log(`\n🔧 ${label}…`);
  execSync(command, { stdio: 'inherit' });
}

function getInstalledVersion(): string {
  try {
    const output = execSync('npx electron --version', { encoding: 'utf-8' }).trim();
    return output.replace(/^v/, '');
  } catch {
    return 'unknown';
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

const originalVersion = getInstalledVersion();
console.log(`📌 Current Electron version: v${originalVersion}`);

const versionSpec =
  requestedVersion === 'latest' ||
  requestedVersion === 'beta' ||
  requestedVersion === 'alpha' ||
  requestedVersion === 'nightly'
    ? `electron@${requestedVersion}`
    : `electron@${requestedVersion}`;

try {
  // Step 1: Install requested version
  run(`rm -rf node_modules/electron && yarn add ${versionSpec} --dev`, `Installing ${versionSpec}`);

  const installedVersion = getInstalledVersion();
  console.log(`\n✅ Installed Electron v${installedVersion}`);

  // Step 2: Reset macOS Screen Recording permission
  if (process.platform === 'darwin') {
    console.log('\n🔐 Resetting macOS Screen Recording permission for new binary…');
    try {
      execSync('tccutil reset ScreenCapture com.github.electron', { stdio: 'inherit' });
      console.log('   You will need to re-grant Screen Recording when prompted.');
    } catch {
      console.log('   Could not reset TCC — you may need to toggle Screen Recording manually.');
    }
  }

  // Step 3: TypeScript check
  run('npx tsc -p electron/tsconfig.json --noEmit', 'Running TypeScript check');
  console.log('✅ TypeScript compilation passed');

  // Step 4: Launch the app
  console.log(`\n🚀 Launching Electron v${installedVersion}…`);
  console.log('   Close the app window to continue and restore the original version.\n');
  spawnSync('yarn', ['dev:electron'], { stdio: 'inherit' });
} finally {
  // Step 5: Restore original version
  if (originalVersion !== 'unknown') {
    console.log(`\n🔄 Restoring original Electron v${originalVersion}…`);
    try {
      execSync(`rm -rf node_modules/electron && yarn add electron@${originalVersion} --dev`, {
        stdio: 'inherit',
      });
      // Restore package.json and yarn.lock to avoid git changes
      execSync('git checkout -- package.json yarn.lock', { stdio: 'inherit' });
      console.log(`✅ Restored Electron v${originalVersion}`);
    } catch (err) {
      console.error(`⚠️  Could not restore v${originalVersion} — run manually:`);
      console.error(`   yarn add electron@${originalVersion} --dev`);
    }
  }
}
