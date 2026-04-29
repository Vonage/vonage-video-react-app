#!/usr/bin/env node
import { execSync } from 'child_process';

const PROJECT_ALIASES: Record<string, string> = {
  frontend: 'frontend',
  backend: 'backend',
  api: 'api',
  core: 'core',
  ui: 'ui',
  common: 'common',
  'integration-tests': 'integration-tests',
};

function runCommand(command: string) {
  execSync(command, { stdio: 'inherit' });
}

function printHelp() {
  console.log('Usage:');
  console.log('  yarn ts-check');
  console.log('  yarn ts-check <project>');
  console.log('');
  console.log('Projects:');
  console.log(`  ${Object.keys(PROJECT_ALIASES).join(', ')}`);
  console.log('');
  console.log('Examples:');
  console.log('  yarn ts-check');
  console.log('  yarn ts-check frontend');
  console.log('  yarn ts-check studio');
}

function main() {
  const commandLineArguments = process.argv.slice(2);
  const [firstArgument, secondArgument] = commandLineArguments;

  const isHelpFlag = (value?: string) => value === '-h' || value === '--help';

  if (isHelpFlag(firstArgument) || isHelpFlag(secondArgument)) {
    printHelp();
    return;
  }

  if (secondArgument) {
    console.error('\nError: Only one project name is supported.\n');
    printHelp();
    process.exit(1);
  }

  const projectName = firstArgument;

  if (!projectName) {
    runCommand('yarn nx run-many -t ts-check --parallel');
    return;
  }

  const resolvedProjectName = PROJECT_ALIASES[projectName];

  if (!resolvedProjectName) {
    console.error(`\nError: Unknown project '${projectName}'.\n`);
    printHelp();
    process.exit(1);
  }

  runCommand(`yarn nx run-many -t ts-check -p ${resolvedProjectName}`);
}

main();
