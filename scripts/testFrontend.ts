#!/usr/bin/env npx tsx

import { execSync } from 'child_process';

const args = process.argv.slice(2);

const VALID_MODES = ['watch', '--watch', 'debug', 'coverage'] as const;

/**
 * Checks if a string looks like a file path.
 * File paths typically contain '/' or '.' characters.
 */
const isFilePath = (str: string): boolean => {
  return str.includes('/') || str.includes('.');
};

/**
 * Helper to execute shell commands with visible output.
 */
const runCommand = (command: string) => {
  console.log(`\n🚀 Running: ${command}\n`);
  execSync(command, { stdio: 'inherit' });
};

const runCommandWithVcrEnv = (command: string) => {
  runCommand(`. ./vcrBuild.env.sh && ${command}`);
};

/**
 * Runs all frontend unit tests using Vitest.
 * Executes the nx test target for the frontend project.
 */
const runAllTests = () => {
  console.log('\n🤖 Running all frontend tests...\n');
  runCommandWithVcrEnv('nx test frontend');
};

/**
 * Runs a specific test file with verbose output.
 * Useful for testing individual test files in isolation.
 */
const runSpecificTest = (testFilePath: string) => {
  console.log(`\n🤖 Running specific test: ${testFilePath}\n`);
  runCommandWithVcrEnv(
    `vitest --root frontend --config vite.config.ts --reporter=verbose --no-coverage --bail=1 --run ${testFilePath}`
  );
};

/**
 * Runs tests in watch mode, re-running on file changes.
 * Sources vcrBuild.env.sh for environment variables.
 * Optionally watches a specific test file.
 */
const runWatch = (testFilePath?: string) => {
  const target = testFilePath ? `file: ${testFilePath}` : 'all tests';
  console.log(`\n👀 Watch mode activated for ${target}\n`);
  const testArg = testFilePath ? ` ${testFilePath}` : '';
  runCommandWithVcrEnv(`vitest --root frontend --config vite.config.ts${testArg}`);
};

/**
 * Runs tests in debug mode with Node.js debugger attached.
 * Allows breakpoint debugging in test files.
 * Disables console interception and file parallelism for clearer debugging.
 */
const runDebug = (testNameOrPath?: string) => {
  const target = testNameOrPath ? `test: ${testNameOrPath}` : 'all tests';
  console.log(`\n🐛 Debug mode activated for ${target}\n`);
  const testArg = testNameOrPath ? ` ${testNameOrPath}` : '';
  runCommandWithVcrEnv(
    `vitest --disableConsoleIntercept=true --silent=false --no-file-parallelism --inspect-brk --root frontend --config vite.config.ts --no-coverage${testArg}`
  );
};

/**
 * Runs tests with coverage enabled.
 * Generates coverage reports for code quality analysis.
 * Optionally runs coverage for a specific test file.
 */
const runCoverage = (testFilePath?: string) => {
  const target = testFilePath ? `file: ${testFilePath}` : 'all tests';
  console.log(`\n📊 Coverage mode activated for ${target}\n`);
  if (testFilePath) {
    runCommandWithVcrEnv(
      `vitest --root frontend --config vite.config.ts --reporter=verbose --coverage --bail=1 --run ${testFilePath}`
    );
    return;
  }

  runCommandWithVcrEnv('nx test frontend --configuration=coverage');
};

/**
 * Main entry point for frontend unit tests.
 *
 * @description
 * Runs Vitest tests for the frontend project with various modes.
 * Defaults to running a specific test file if the first argument doesn't match a mode.
 *
 * @modes
 * - (no args)           - Run all frontend tests
 * - watch [file-path]   - Watch mode (re-run on changes)
 * - debug [file-path]   - Debug mode (attach Node debugger with breakpoints)
 * - coverage [file-path]- Run with coverage reports
 * - <file-path>         - Run specific test file
 *
 * @example
 * yarn test:frontend
 * yarn test:frontend src/components/Button/Button.test.tsx
 * yarn test:frontend watch
 * yarn test:frontend watch src/hooks/useAuth.test.ts
 * yarn test:frontend debug src/services/api.test.ts
 * yarn test:frontend coverage
 * yarn test:frontend coverage src/utils/format.test.ts
 */
const main = () => {
  const [firstArg, secondArg] = args;

  const noArgs = !firstArg;
  const isDebugMode = firstArg === 'debug';
  const isWatchMode = firstArg === 'watch' || firstArg === '--watch';
  const isCoverageMode = firstArg === 'coverage';
  const isKnownMode = VALID_MODES.includes(firstArg as (typeof VALID_MODES)[number]);

  if (noArgs) {
    runAllTests();
    return;
  }

  // Validate mode if it looks like a mode (not a file path)
  if (firstArg && !isFilePath(firstArg) && !isKnownMode) {
    console.error(`\n❌ Error: Unknown mode '${firstArg}'\n`);
    console.error('Valid modes:');
    console.error('  • watch      - Watch mode (re-run on changes)');
    console.error('  • debug      - Debug mode (attach Node debugger)');
    console.error('  • coverage   - Run with coverage reports');
    console.error('  • <file-path>- Run specific test file\n');
    console.error('Examples:');
    console.error('  yarn test:frontend');
    console.error('  yarn test:frontend watch');
    console.error('  yarn test:frontend debug src/test.ts');
    console.error('  yarn test:frontend src/components/Button.test.tsx\n');
    process.exit(1);
  }

  if (isDebugMode) {
    runDebug(secondArg);
    return;
  }

  if (isWatchMode) {
    runWatch(secondArg);
    return;
  }

  if (isCoverageMode) {
    runCoverage(secondArg);
    return;
  }

  runSpecificTest(firstArg);
};

main();
