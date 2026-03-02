#!/usr/bin/env node
import { execSync } from 'child_process';

/**
 * Workspace quality checks (TypeScript + lint + formatting).
 *
 * @description
 * Default behavior matches the previous package.json script:
 * - Runs `ts-check` and `lint` targets across the workspace (Nx run-many)
 * - Runs Prettier in check mode across the repo
 *
 * Optionally, you can scope the checks to a single project:
 * - `yarn quality-check api`
 * - `yarn quality-check frontend`
 *
 * @example
 * yarn quality-check
 * yarn quality-check api
 * yarn quality-check frontend
 * yarn quality-check backend
 */

const PROJECT_ROOTS: Record<string, string> = {
  frontend: 'frontend',
  backend: 'backend',
  api: 'libs/api',
  core: 'libs/core',
  ui: 'libs/ui',
  common: 'libs/common',
  'integration-tests': 'integration-tests',
};

function runCommand(command: string) {
  execSync(command, { stdio: 'inherit' });
}

function printHelp() {
  console.log('Usage:');
  console.log('  yarn quality-check');
  console.log('  yarn quality-check <project>');
  console.log('');
  console.log('Projects:');
  console.log(`  ${Object.keys(PROJECT_ROOTS).join(', ')}`);
  console.log('');
  console.log('Examples:');
  console.log('  yarn quality-check');
  console.log('  yarn quality-check api');
  console.log('  yarn quality-check frontend');
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

  const taskRunnerCommand = (() => {
    if (!projectName) return 'yarn nx run-many -t ts-check,lint --parallel';
    return `yarn nx run-many -t ts-check,lint -p ${projectName} --parallel`;
  })();

  runCommand(taskRunnerCommand);

  const prettierTarget = projectName ? PROJECT_ROOTS[projectName] : '.';

  runCommand(`yarn prettier ${prettierTarget} --check --log-level warn`);
}

main();
