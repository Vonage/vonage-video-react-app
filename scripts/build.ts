#!/usr/bin/env npx tsx

import { execSync } from 'child_process';
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';

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

const VERCEL_OUTPUT_DIR = '.vercel/output';
const VERCEL_FUNCTION_DIR = `${VERCEL_OUTPUT_DIR}/functions/api.func`;

// Paths handled by the Express backend, every other path is served from the static frontend build.
const VERCEL_API_ROUTE = '^/(_|session|feedback|\\.well-known|client-logs|v2|auth|api/auth)(/.*)?$';

/**
 * Builds the app for Vercel using the Build Output API (https://vercel.com/docs/build-output-api/v3):
 * the frontend is served as static files and the Express backend runs as a single Node.js function.
 */
const buildVercel = () => {
  buildAll();
  runCommand('nx run backend:build:vercel');

  rmSync(VERCEL_OUTPUT_DIR, { recursive: true, force: true });
  mkdirSync(VERCEL_FUNCTION_DIR, { recursive: true });

  cpSync('backend/dist/dist', `${VERCEL_OUTPUT_DIR}/static`, { recursive: true });
  cpSync('backend/dist/vercel.cjs', `${VERCEL_FUNCTION_DIR}/index.cjs`);

  writeFileSync(
    `${VERCEL_FUNCTION_DIR}/.vc-config.json`,
    JSON.stringify(
      {
        runtime: 'nodejs22.x',
        handler: 'index.cjs',
        launcherType: 'Nodejs',
        // Express parses requests itself, the Vercel request/response helpers are not needed.
        shouldAddHelpers: false,
      },
      null,
      2
    )
  );

  writeFileSync(
    `${VERCEL_OUTPUT_DIR}/config.json`,
    JSON.stringify(
      {
        version: 3,
        routes: [
          {
            src: '/(.*)',
            headers: { 'X-Robots-Tag': 'noindex, nofollow' },
            continue: true,
          },
          { src: VERCEL_API_ROUTE, dest: '/api' },
          { handle: 'filesystem' },
          { src: '/(.*)', dest: '/index.html' },
        ],
      },
      null,
      2
    )
  );

  console.log(`\n✅ Vercel build output written to ${VERCEL_OUTPUT_DIR}`);
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
 * Builds the @vonage/video-reference-apps-common library package.
 */
const buildCommon = () => {
  runCommand('nx run common:build');
};

/**
 * Main entry point for build commands.
 *
 * Targets:
 * - No args: Build both frontend and backend
 * - frontend: Build only frontend
 * - backend: Build only backend
 * - common: Build @vonage/video-reference-apps-common library
 * - room: Build VeraRoom web component
 * - room zip: Build and zip VeraRoom artifact
 * - vercel: Build frontend and backend into Vercel's Build Output API format (.vercel/output)
 *
 * Usage:
 * - yarn build           (build frontend and backend)
 * - yarn build frontend  (build only frontend)
 * - yarn build backend   (build only backend)
 * - yarn build common   (build @vonage/video-reference-apps-common library)
 * - yarn build room      (build VeraRoom web component)
 * - yarn build room zip  (build and zip VeraRoom artifact)
 * - yarn build vercel    (build for Vercel deployment)
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
    case 'common':
      buildCommon();
      return;
    case 'vercel':
      buildVercel();
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
