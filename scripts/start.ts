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
  const roomPort = 3350;

  // Build
  console.log('\n📦 Building VeraRoom...\n');
  runCommand('nx run frontend:build-room:standalone');
  runCommand('nx run frontend:build-room-example');

  const distRoomPath = path.resolve(__dirname, '../frontend/distRoom');

  // Start backend on default port 3345
  const backend = spawn('npx', ['nx', 'run', 'backend:start'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, FRONTEND_TARGET: `http://localhost:${roomPort}/example.html` },
  });

  // Start room example on separate port
  const roomServer = spawn('npx', ['http-server', distRoomPath, '-c-1', '-p', String(roomPort)], {
    stdio: 'inherit',
    shell: true,
  });

  const shutdown = () => {
    backend.kill('SIGTERM');
    roomServer.kill('SIGTERM');
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  backend.on('error', (err) => {
    console.error('Failed to start backend:', err);
    shutdown();
    process.exit(1);
  });

  roomServer.on('error', (err) => {
    console.error('Failed to start http-server:', err);
    shutdown();
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
