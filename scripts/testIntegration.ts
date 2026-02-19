#!/usr/bin/env npx tsx

import { execSync } from 'child_process';

const args = process.argv.slice(2);

const VALID_MODES = ['debug', 'inspect', 'canon', 'update', 'updateScreenshots'] as const;

type ValidMode = (typeof VALID_MODES)[number];

/**
 * Checks if a string looks like a file path.
 * File paths typically contain '/' or '.' characters.
 */
const isFilePath = (str: string): boolean => {
  return str.includes('/') || str.includes('.');
};

/**
 * Helper to execute shell commands with visible output.
 * Clears NODE_OPTIONS by default to prevent debugger from attaching to child processes.
 * Pass preserveNodeOptions=true to keep debugger for debug/inspect modes.
 */
const runCommand = (command: string, { preserveNodeOptions = false } = {}) => {
  console.log(`\n🚀 Running: ${command}\n`);
  execSync(command, {
    stdio: 'inherit',
    env: preserveNodeOptions ? process.env : { ...process.env, NODE_OPTIONS: '' },
  });
};

/**
 * Runs all integration tests across all browsers.
 * Uses Playwright's default configuration (Chrome, Firefox, Mobile Chrome).
 * Uses nx target for caching benefits.
 */
const runAllTests = () => {
  console.log('\n🤖 Running all integration tests (Chrome, Firefox, Mobile Chrome)...\n');
  runCommand('nx run integration-tests:test');
};

/**
 * Runs a specific test in headed Chrome mode.
 * Test runs in headed mode (browser window visible) for debugging.
 */
const runHeadedTest = (testNameOrPath: string) => {
  console.log(`\n🤖 Running test in headed Chrome: ${testNameOrPath}\n`);
  runCommand(
    `cd integration-tests && headedMode=true playwright test ${testNameOrPath} --project='Google Chrome Fake Devices' --workers=1 --headed`
  );
};

/**
 * Runs tests in debug mode with Playwright Inspector.
 * Allows step-through debugging of test execution.
 */
const runDebug = (testNameOrPath?: string) => {
  const target = testNameOrPath || 'all tests';
  console.log(`\n🐛 Debug mode activated (Playwright Inspector) for ${target}\n`);
  const testArg = testNameOrPath || '';
  runCommand(
    `cd integration-tests && headedMode=true debugMode=true inspectMode=true PWDEBUG=1 playwright test ${testArg} --project='Google Chrome Fake Devices' --workers=1 --timeout=0`,
    { preserveNodeOptions: true }
  );
};

/**
 * Runs tests with Playwright Inspector in inspect mode.
 * Similar to debug but with different UI experience.
 */
const runInspect = (testNameOrPath?: string) => {
  const target = testNameOrPath || 'all tests';
  console.log(`\n🔍 Inspect mode activated (Chrome DevTools) for ${target}\n`);
  const testArg = testNameOrPath || '';
  runCommand(
    `cd integration-tests && headedMode=true inspectMode=true playwright test ${testArg} --project='Google Chrome Fake Devices' --workers=1 --headed`,
    { preserveNodeOptions: true }
  );
};

/**
 * Runs visual comparison tests to generate canonical screenshots.
 * Used to establish baseline screenshots for visual regression testing.
 */
const runCanon = (testNameOrPath?: string) => {
  const target = testNameOrPath || 'all tests';
  console.log(`\n📸 Generating canonical screenshots for ${target}\n`);
  const testArg = testNameOrPath || '';
  runCommand(
    `cd integration-tests && playwright test ${testArg} --project='Google Chrome Fake Devices' --workers=1`
  );
};

/**
 * Updates test screenshots to match current visual state.
 * Used when intentional UI changes require new baseline screenshots.
 * Runs across all browsers (Chrome, Firefox, Mobile Chrome).
 */
const updateScreenshots = (testNameOrPath?: string) => {
  const testArg = testNameOrPath || 'tests/visualComparisons.spec.ts';
  console.log(`\n🔄 Updating screenshots for ${testArg}\n`);

  runCommand(
    `cd integration-tests && playwright test ${testArg} --project='Google Chrome Fake Devices' --project=firefox --project='Mobile Chrome' --update-snapshots`
  );
};

/**
 * Main entry point for Playwright integration tests.
 *
 * @description
 * Runs Playwright end-to-end tests with various modes.
 * Tests run across multiple browsers (Chrome, Firefox, Mobile Chrome) by default.
 * Defaults to running a specific test in headed Chrome if the first argument doesn't match a mode.
 *
 * @modes
 * - (no args)             - Run all tests in all browsers (headless)
 * - debug [test-name]     - Debug mode (Playwright Inspector + Chrome DevTools, timeout disabled)
 * - inspect [test-name]   - Inspect mode (Chrome DevTools, headed mode)
 * - canon [test-name]     - Generate canonical screenshots (baseline for visual regression)
 * - update [test-name]    - Update test screenshots (all browsers)
 * - <test-name>           - Run specific test in headed Chrome
 *
 * @example
 * yarn test:integration
 * yarn test:integration callQuality
 * yarn test:integration debug
 * yarn test:integration debug callQuality
 * yarn test:integration inspect visualComparisons
 * yarn test:integration canon
 * yarn test:integration update
 * yarn test:integration update tests/visualComparisons.spec.ts
 */
const main = () => {
  const [firstArg, secondArg] = args;

  const noArgs = !firstArg;
  const isDebugMode = firstArg === 'debug';
  const isInspectMode = firstArg === 'inspect';
  const isCanonMode = firstArg === 'canon';
  const isUpdateMode = firstArg === 'update' || firstArg === 'updateScreenshots';
  const isKnownMode = VALID_MODES.includes(firstArg as ValidMode);

  if (noArgs) {
    runAllTests();
    return;
  }

  // Validate mode if it looks like a mode (not a test path)
  if (firstArg && !isFilePath(firstArg) && !isKnownMode) {
    // Could be a test name, which is valid
    // Only show error if it starts with '-' or looks like an invalid flag
    if (firstArg.startsWith('-') || firstArg.startsWith('--')) {
      console.error(`\n❌ Error: Unknown mode '${firstArg}'\n`);
      console.error('Valid modes:');
      console.error('  • debug      - Debug mode (Playwright Inspector, no timeout)');
      console.error('  • inspect    - Inspect mode (Chrome DevTools, headed)');
      console.error('  • canon      - Generate canonical screenshots');
      console.error('  • update     - Update test screenshots');
      console.error('  • <test-name>- Run specific test in headed Chrome\n');
      console.error('Examples:');
      console.error('  yarn test:integration');
      console.error('  yarn test:integration callQuality');
      console.error('  yarn test:integration debug');
      console.error('  yarn test:integration update\n');
      process.exit(1);
    }
  }

  if (isDebugMode) {
    runDebug(secondArg);
    return;
  }

  if (isInspectMode) {
    runInspect(secondArg);
    return;
  }

  if (isCanonMode) {
    runCanon(secondArg);
    return;
  }

  if (isUpdateMode) {
    updateScreenshots(secondArg);
    return;
  }

  runHeadedTest(firstArg);
};

main();
