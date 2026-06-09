#!/usr/bin/env npx tsx

import { execSync } from 'child_process';
import { writeFileSync } from 'node:fs';

const args = process.argv.slice(2);

/**
 * Helper to execute shell commands with visible output.
 */
const runCommand = (command: string) => {
  console.log(`\n🚀 Running: ${command}\n`);
  execSync(command, { stdio: 'inherit' });
};

/**
 * Builds both frontend and backend projects.
 */
const buildAll = () => {
  // webpack does not clean its output dir - delete it manually before building.
  // frontend/dist and frontend/distRoom are cleaned by Vite's emptyOutDir: true.
  runCommand('rm -rf ./backend/dist');

  // Build frontend, backend and room in parallel
  runCommand(`
    bash -c '
      nx run frontend:build & pid1=$!
      nx run backend:build & pid2=$!
      nx run frontend:build-room & pid3=$!

      status=0

      wait "$pid1" || status=1
      wait "$pid2" || status=1
      wait "$pid3" || status=1

      exit "$status"
    '
  `);

  // Copy frontend assets to backend dist for serving
  runCommand(
    'mkdir -p backend/dist/dist/assets && cp -R frontend/dist/assets/. backend/dist/dist/assets/'
  );

  // Copy room.js to backend dist for serving
  runCommand('cp frontend/distRoom/room.js backend/dist/dist/assets/room.js');

  // Write a manifest file with a timestamp to force cache busting of the VeraRoom web component
  writeFileSync('backend/dist/dist/assets/room-manifest.json', JSON.stringify({ v: Date.now() }));
};

/**
 * Builds only the frontend project.
 */
const buildFrontend = () => {
  runCommand('nx run frontend:build');
};

/**
 * Builds only the backend project.
 */
const buildBackend = () => {
  // webpack does not clean its output dir - delete it manually before building.
  runCommand('rm -rf ./backend/dist');
  runCommand('nx run backend:build');
};

/**
 * Builds the VeraRoom web component.
 */
const buildRoom = () => {
  runCommand('nx run frontend:build-room:standalone');
};

/**
 * Builds and packages the VeraRoom artifact into a zip file.
 */
const buildRoomZip = () => {
  runCommand('nx run frontend:build-room:standalone');
  runCommand('rm -f room.zip && cd frontend/distRoom && zip -rq ../../room.zip .');
};

/**
 * Main entry point for build commands.
 *
 * Targets:
 * - No args: Build both frontend and backend
 * - frontend: Build only frontend
 * - backend: Build only backend
 * - room: Build VeraRoom web component
 * - room zip: Build and zip VeraRoom artifact
 *
 * Usage:
 * - yarn build           (build frontend and backend)
 * - yarn build frontend  (build only frontend)
 * - yarn build backend   (build only backend)
 * - yarn build room      (build VeraRoom web component)
 * - yarn build room zip  (build and zip VeraRoom artifact)
 */
const main = () => {
  const [target, subTarget] = args;

  switch (target) {
    case 'frontend':
      buildFrontend();
      return;
    case 'backend':
      buildBackend();
      return;
    case 'room':
      if (subTarget === 'zip') {
        buildRoomZip();
        return;
      }

      buildRoom();
      return;
    default:
      buildAll();
  }
};

main();
