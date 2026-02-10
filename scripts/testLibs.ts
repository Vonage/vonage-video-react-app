#!/usr/bin/env node
import { execSync } from 'child_process';

type LibraryName = 'core' | 'ui' | 'common' | 'api';

const VALID_MODES = ['watch', '--watch', 'coverage'] as const;

/**
 * Checks if a string looks like a file path.
 * File paths typically contain '/' or '.' characters.
 */
const isFilePath = (str: string): boolean => {
  return str.includes('/') || str.includes('.');
};

/**
 * Runs all library tests using Vitest.
 * Executes the nx test target for the specified library.
 */
function runAllTests(lib: LibraryName) {
  console.log(`\n🤖 Running all ${lib} tests...\n`);
  execSync(`yarn nx test ${lib}`, {
    stdio: 'inherit',
  });
}

/**
 * Runs a specific library test file matching the given pattern.
 * Uses Vitest's pattern matching to filter tests.
 */
function runSpecificTest(lib: LibraryName, testPattern: string) {
  console.log(`\n🤖 Running specific ${lib} test: ${testPattern}\n`);
  execSync(`yarn nx test ${lib} --run ${testPattern}`, {
    stdio: 'inherit',
  });
}

/**
 * Runs library tests in watch mode, re-running on file changes.
 * Optionally watches a specific test file.
 */
function runWatch(lib: LibraryName, testPattern?: string) {
  const target = testPattern ? `file: ${testPattern}` : 'all tests';
  console.log(`\n👀 Watch mode activated for ${lib} ${target}\n`);
  const pattern = testPattern ? ` ${testPattern}` : '';
  execSync(`yarn nx test ${lib} --watch${pattern}`, {
    stdio: 'inherit',
  });
}

/**
 * Runs library tests with coverage enabled.
 * Generates coverage reports for code quality analysis.
 * Optionally runs coverage for a specific test file.
 */
function runCoverage(lib: LibraryName, testPattern?: string) {
  const target = testPattern ? `file: ${testPattern}` : 'all tests';
  console.log(`\n📊 Coverage mode activated for ${lib} ${target}\n`);
  const pattern = testPattern ? ` --run ${testPattern}` : '';
  execSync(`yarn nx test ${lib} --coverage${pattern}`, {
    stdio: 'inherit',
  });
}

/**
 * Main entry point for library tests (core, ui, common).
 *
 * @description
 * Runs Vitest tests for the specified library (core, ui, or common).
 * First argument must be the library name.
 * Second argument can be a mode or a test file path.
 *
 * @modes
 * - <lib>                    - Run all tests for the library
 * - <lib> watch [file-path]  - Watch mode (re-run on changes)
 * - <lib> coverage [file-path]- Run with coverage reports
 * - <lib> <file-path>        - Run specific test file
 *
 * @example
 * yarn test:core
 * yarn test:common
 * yarn test:api
 * yarn test:ui
 * yarn test:core src/stores/devices/devicesStore.test.ts
 * yarn test:common watch
 * yarn test:ui watch src/components/Button/Button.test.tsx
 * yarn test:core coverage
 * yarn test:common coverage src/hooks/useStableRef.test.ts
 */
function main() {
  const args = process.argv.slice(2);
  const [lib, secondArg, thirdArg] = args as [LibraryName, string?, string?];

  if (!lib || !['core', 'ui', 'common', 'api'].includes(lib)) {
    console.error('\n❌ Error: First argument must be a library name\n');
    console.error('Valid libraries:');
    console.error('  • api    - Backend API library (@api-lib)');
    console.error('  • core   - Core library (@core)');
    console.error('  • ui     - UI library (@ui)');
    console.error('  • common - Common library (@common)\n');
    console.error('Examples:');
    console.error('  yarn test:core');
    console.error('  yarn test:common watch');
    console.error('  yarn test:ui coverage\n');
    process.exit(1);
  }

  const noSecondArg = !secondArg;
  const isWatchMode = secondArg === 'watch' || secondArg === '--watch';
  const isCoverageMode = secondArg === 'coverage';
  const isKnownMode = VALID_MODES.includes(secondArg as (typeof VALID_MODES)[number]);

  if (noSecondArg) {
    runAllTests(lib);
    return;
  }

  // Validate mode if it looks like a mode (not a file path)
  if (secondArg && !isFilePath(secondArg) && !isKnownMode) {
    console.error(`\n❌ Error: Unknown mode '${secondArg}' for library '${lib}'\n`);
    console.error('Valid modes:');
    console.error('  • watch      - Watch mode (re-run on changes)');
    console.error('  • coverage   - Run with coverage reports');
    console.error('  • <file-path>- Run specific test file\n');
    console.error('Examples:');
    console.error(`  yarn test:${lib}`);
    console.error(`  yarn test:${lib} watch`);
    console.error(`  yarn test:${lib} coverage`);
    console.error(`  yarn test:${lib} src/path/to/test.ts\n`);
    process.exit(1);
  }

  if (isWatchMode) {
    runWatch(lib, thirdArg);
    return;
  }

  if (isCoverageMode) {
    runCoverage(lib, thirdArg);
    return;
  }

  runSpecificTest(lib, secondArg);
}

main();
