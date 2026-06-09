#!/usr/bin/env node
import { execSync } from 'child_process';

const VALID_MODES = ['watch', '--watch', 'debug', 'coverage'] as const;

/**
 * Checks if a string looks like a file path.
 * File paths typically contain '/' or '.' characters.
 */
const isFilePath = (str: string): boolean => {
  return str.includes('/') || str.includes('.');
};

/**
 * Runs all backend unit tests using Jest.
 * Executes the nx test target for the backend project.
 */
function runAllTests() {
  console.log('\n🤖 Running all backend tests...\n');
  execSync('yarn nx test backend', {
    stdio: 'inherit',
  });
}

/**
 * Runs a specific backend test file matching the given path pattern.
 * Uses Jest's testPathPattern to filter tests.
 */
function runSpecificTest(testFilePath: string) {
  console.log(`\n🤖 Running specific test: ${testFilePath}\n`);
  execSync(`yarn nx test backend --testPathPattern="${testFilePath}"`, {
    stdio: 'inherit',
  });
}

/**
 * Runs backend tests in watch mode, re-running on file changes.
 * Sources vcrBuild.env.sh for environment variables.
 * Uses Jest's watch mode with coverage enabled.
 * Optionally watches a specific test file.
 */
function runWatch(testFilePath?: string) {
  const target = testFilePath ? `file: ${testFilePath}` : 'all tests';
  console.log(`\n👀 Watch mode activated for ${target}\n`);
  const testPattern = testFilePath ? ` --testPathPattern="${testFilePath}"` : '';
  execSync(
    `bash -c 'source ../vcrBuild.env.sh && NODE_OPTIONS="--experimental-vm-modules" jest --maxWorkers=1 --coverage --watch${testPattern}'`,
    { stdio: 'inherit', cwd: 'backend' }
  );
}

/**
 * Runs backend tests in debug mode with Node.js debugger attached.
 * Allows breakpoint debugging in test files.
 * Runs tests serially (--runInBand) with verbose output and handle detection.
 */
function runDebug(testFilePath?: string) {
  const target = testFilePath ? `test: ${testFilePath}` : 'all tests';
  console.log(`\n🐛 Debug mode activated for ${target}\n`);
  const testPattern = testFilePath ? ` --testPathPattern="${testFilePath}"` : '';
  execSync(
    `bash -c 'source ../vcrBuild.env.sh && NODE_OPTIONS="--experimental-vm-modules --inspect-brk" jest --runInBand --detectOpenHandles --verbose${testPattern}'`,
    { stdio: 'inherit', cwd: 'backend' }
  );
}

/**
 * Runs backend tests with coverage enabled.
 * Generates coverage reports for code quality analysis.
 * Optionally runs coverage for a specific test file.
 */
function runCoverage(testFilePath?: string, html = false) {
  const target = testFilePath ? `file: ${testFilePath}` : 'all tests';
  console.log(`\n📊 Coverage mode activated for ${target}\n`);

  const htmlReporter = html ? ' --coverageReporters=html' : '';

  if (testFilePath) {
    execSync(
      `yarn nx test backend --configuration=coverage --testPathPattern="${testFilePath}"${htmlReporter}`,
      {
        stdio: 'inherit',
      }
    );
    return;
  }

  execSync(`yarn nx test backend --configuration=coverage${htmlReporter}`, {
    stdio: 'inherit',
  });
}

/**
 * Main entry point for backend unit tests.
 *
 * @description
 * Runs Jest tests for the backend project with various modes.
 * Defaults to running a specific test file if the first argument doesn't match a mode.
 *
 * @modes
 * - (no args)                - Run all backend tests
 * - watch [file-path]        - Watch mode (re-run on changes with coverage)
 * - debug [file-path]        - Debug mode (attach Node debugger, run serially)
 * - coverage [file-path]     - Run with coverage reports
 * - coverage html [file-path]- Run with HTML coverage report
 * - <file-path>              - Run specific test file
 *
 * @example
 * yarn test:backend
 * yarn test:backend routes/session.test.ts
 * yarn test:backend watch
 * yarn test:backend watch helpers/config.test.ts
 * yarn test:backend debug services/feedbackService.test.ts
 * yarn test:backend coverage
 * yarn test:backend coverage videoService
 * yarn test:backend coverage html
 * yarn test:backend coverage html routes/session.test.ts
 */
function main() {
  const args = process.argv.slice(2);
  const [firstArg, secondArg, thirdArg] = args;

  const noArgs = args.length === 0;
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
    console.error('  yarn test:backend');
    console.error('  yarn test:backend watch');
    console.error('  yarn test:backend debug routes/session.test.ts');
    console.error('  yarn test:backend routes/health.test.ts\n');
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
    const isHtmlCoverage = secondArg === 'html';
    const testFilePath = isHtmlCoverage ? thirdArg : secondArg;

    runCoverage(testFilePath, isHtmlCoverage);
    return;
  }

  runSpecificTest(firstArg);
}

main();
