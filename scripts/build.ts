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
 * Main entry point for build commands.
 *
 * Targets:
 * - No args: Build both frontend and backend
 * - frontend: Build only frontend
 * - backend: Build only backend
 * - room: Build VeraRoom web component
 *
 * Usage:
 * - yarn build           (build frontend and backend)
 * - yarn build frontend  (build only frontend)
 * - yarn build backend   (build only backend)
 * - yarn build room      (build VeraRoom web component)
 */
const main = () => {
  const [target] = args;

  switch (target) {
    case 'frontend':
      buildFrontend();
      return;
    case 'backend':
      buildBackend();
      return;
    case 'room':
      buildRoom();
      return;
    default:
      buildAll();
  }
};

main();
