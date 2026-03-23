#!/usr/bin/env npx tsx

import { execSync } from 'child_process';

const args = process.argv.slice(2);

/**
 * Helper to execute shell commands with visible output.
 */
function runCommand(command: string): void {
  console.log(`\n🚀 Running: ${command}\n`);
  execSync(command, { stdio: 'inherit' });
}

/**
 * Runs both frontend and backend in development mode.
 */
function devAll(): void {
  runCommand("concurrently 'nx run frontend:dev' 'nx run backend:dev'");
}

/**
 * Runs only the frontend in development mode.
 */
function devFrontend(): void {
  runCommand('nx run frontend:dev');
}

/**
 * Runs only the backend in development mode.
 */
function devBackend(): void {
  runCommand('nx run backend:dev');
}

/**
 * Runs Storybook focused on VeraRoom component.
 */
function devRoom(): void {
  const storyPath = '/story/veraroom-veraroomelement--default';

  console.log('\n📚 Starting Storybook for VeraRoom...\n');
  console.log(`🌐 Opening: http://localhost:6006/?path=${storyPath}\n`);

  runCommand(`nx run frontend:storybook -- --initial-path="${storyPath}"`);
}

/**
 * Main entry point for dev commands.
 *
 * Targets:
 * - No args: Run both frontend and backend in dev mode
 * - frontend: Run only frontend dev server
 * - backend: Run only backend dev server
 * - room: Run Storybook focused on VeraRoom component
 *
 * Usage:
 * - yarn dev           (run frontend and backend)
 * - yarn dev frontend  (run only frontend)
 * - yarn dev backend   (run only backend)
 * - yarn dev room      (run Storybook for VeraRoom)
 */
function main(): void {
  const [target] = args;

  switch (target) {
    case 'frontend':
      devFrontend();
      return;
    case 'backend':
      devBackend();
      return;
    case 'room':
      devRoom();
      return;
    default:
      devAll();
  }
}

main();
