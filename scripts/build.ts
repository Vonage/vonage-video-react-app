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
 * Builds both frontend and backend projects.
 */
const buildAll = () => {
  runCommand('nx run-many -t build -p frontend backend');
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
  runCommand('nx run backend:build');
};

/**
 * Builds the VeraRoom web component.
 */
const buildRoom = () => {
  runCommand('nx run frontend:build-room');
};

/**
 * Builds and packages the VeraRoom artifact into a zip file.
 */
const buildRoomZip = () => {
  runCommand('nx run frontend:build-room');
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
