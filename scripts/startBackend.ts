#!/usr/bin/env npx tsx

import { execSync } from 'child_process';

const args = process.argv.slice(2);

/**
 * Helper to execute shell commands with visible output.
 */
const runCommand = (command: string) => {
  console.log(`\n🚀 Running: ${command}\n`);
  execSync(command, { stdio: 'inherit' });
};

/**
 * Starts the backend server in development mode.
 * Uses nx dev to start the Express server with hot reload.
 */
const runStart = () => {
  runCommand('nx run backend:dev');
};

/**
 * Starts the backend server in debug mode with Node.js debugger attached.
 * Allows breakpoint debugging in backend code.
 */
const runDebug = () => {
  runCommand('nx run backend:debug');
};

/**
 * Starts the bundled backend server (development build).
 * Runs the webpack development bundle instead of tsx with hot reload.
 */
const runBundled = () => {
  runCommand('nx run backend:start:bundled');
};

/**
 * Main entry point for backend server startup.
 *
 * Modes:
 * - No args: Start backend server in dev mode (hot reload)
 * - debug/--debug: Start in debug mode with debugger attached
 * - bundled: Start using development webpack bundle
 *
 * Usage:
 * - yarn start:backend         (development mode with hot reload)
 * - yarn start:backend debug   (debug mode)
 * - yarn start:backend bundled (bundled development mode)
 */
const main = () => {
  const [firstArg] = args;

  const isDebugMode = firstArg === 'debug' || firstArg === '--debug';
  const isBundledMode = firstArg === 'bundled';

  if (isDebugMode) {
    runDebug();
    return;
  }

  if (isBundledMode) {
    runBundled();
    return;
  }

  runStart();
};

main();
