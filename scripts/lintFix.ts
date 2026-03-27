#!/usr/bin/env node
import { execSync } from 'child_process';

/**
 * Lint fix script (format + lint autofix + format verification).
 *
 * @description
 * Default behavior matches the previous package.json script:
 * - Runs Prettier in write mode to format files
 * - Runs `lint` target with --fix across the workspace (Nx run-many)
 * - Runs Prettier in check mode to verify formatting
 *
 * Optionally, you can scope the checks to a single project:
 * - `yarn lint:fix frontend`
 * - `yarn lint:fix backend`
 *
 * @example
 * yarn lint:fix
 * yarn lint:fix frontend
 * yarn lint:fix backend
 * yarn lint:fix core
 */

const PROJECT_ROOTS: Record<string, string> = {
  frontend: 'frontend',
  backend: 'backend',
  core: 'libs/core',
  ui: 'libs/ui',
  common: 'libs/common',
  'integration-tests': 'integration-tests',
};

function runCommand(command: string) {
  console.log(`\n🚀 Running: ${command}\n`);
  execSync(command, { stdio: 'inherit' });
}

function printHelp() {
  console.log('Usage:');
  console.log('  yarn lint:fix');
  console.log('  yarn lint:fix <project>');
  console.log('');
  console.log('Projects:');
  console.log(`  ${Object.keys(PROJECT_ROOTS).join(', ')}`);
  console.log('');
  console.log('Examples:');
  console.log('  yarn lint:fix');
  console.log('  yarn lint:fix frontend');
  console.log('  yarn lint:fix backend');
  console.log('  yarn lint:fix core');
}

function main() {
  const commandLineArguments = process.argv.slice(2);
  const [firstArgument, secondArgument] = commandLineArguments;

  const isHelpFlag = (value?: string) => value === '-h' || value === '--help';

  const shouldPrintHelp = isHelpFlag(firstArgument) || isHelpFlag(secondArgument);
  if (shouldPrintHelp) {
    printHelp();
    return;
  }

  if (secondArgument) {
    console.error('\n❌ Error: Only one project name is supported.\n');
    printHelp();
    process.exit(1);
  }

  const projectName = firstArgument;

  if (projectName && !PROJECT_ROOTS[projectName]) {
    console.error(`\n❌ Error: Unknown project '${projectName}'.\n`);
    printHelp();
    process.exit(1);
  }

  const prettierTarget = projectName ? PROJECT_ROOTS[projectName] : '.';

  console.log('\n📝 Step 1/3: Formatting files with Prettier...');
  runCommand(`prettier --log-level warn --write ${prettierTarget}`);

  console.log('\n🔧 Step 2/3: Running ESLint with autofix...');
  const lintCommand = (() => {
    if (!projectName) return 'nx run-many -t lint -- --fix';
    return `nx run-many -t lint -p ${projectName} -- --fix`;
  })();
  runCommand(lintCommand);

  console.log('\n✅ Step 3/3: Verifying formatting with Prettier...');
  runCommand(`prettier --log-level warn --check ${prettierTarget}`);

  console.log('\n🎉 Lint fix completed successfully!\n');
}

main();
