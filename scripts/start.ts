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
 * Builds frontend and starts backend in production mode.
 */
function startAll(): void {
  runCommand('nx run frontend:build && nx run backend:start');
}

/**
 * Builds VeraRoom and serves the example page with http-server.
 */
function startRoom(): void {
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
 * Main entry point for start commands.
 *
 * Targets:
 * - No args: Build frontend and start backend in production mode
 * - room: Build VeraRoom and serve example.html
 *
 * Usage:
 * - yarn start        (build frontend and start backend)
 * - yarn start room   (build and serve VeraRoom example)
 */
function main(): void {
  const [target] = args;

  switch (target) {
    case 'room':
      startRoom();
      return;
    default:
      startAll();
  }
}

main();
