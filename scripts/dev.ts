#!/usr/bin/env npx tsx

import { execSync, spawn } from 'child_process';
import * as path from 'node:path';

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
 * Builds VeraRoom and serves the example page with http-server.
 */
function devRoom(): void {
  // Build
  console.log('\n📦 Building VeraRoom...\n');
  runCommand('nx run frontend:build-room');

  const distRoomPath = path.resolve(__dirname, '../frontend/distRoom');

  // Start http-server on port 3345
  const server = spawn('npx', ['http-server', distRoomPath, '-c-1', '-p', '3345'], {
    stdio: ['inherit', 'pipe', 'inherit'],
    shell: true,
  });

  server.stdout?.on('data', (data: Buffer) => {
    const output = data.toString();
    process.stdout.write(output);

    // Print URL once server is ready
    if (output.includes('Available on')) {
      console.log('\n' + '='.repeat(50));
      console.log('🌐 VeraRoom Example:');
      console.log('   http://localhost:3345/example.html');
      console.log('='.repeat(50) + '\n');
    }
  });

  server.on('error', (err) => {
    console.error('Failed to start http-server:', err);
    process.exit(1);
  });
}

/**
 * Main entry point for dev commands.
 *
 * Targets:
 * - No args: Run both frontend and backend in dev mode
 * - frontend: Run only frontend dev server
 * - backend: Run only backend dev server
 * - room: Build VeraRoom and serve example.html
 *
 * Usage:
 * - yarn dev           (run frontend and backend)
 * - yarn dev frontend  (run only frontend)
 * - yarn dev backend   (run only backend)
 * - yarn dev room      (build and serve VeraRoom example)
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
