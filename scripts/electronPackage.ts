#!/usr/bin/env npx tsx

import { execSync } from 'child_process';

/**
 * Helper to execute shell commands with visible output.
 */
function runCommand(command: string): void {
  console.log(`\n🚀 Running: ${command}\n`);
  execSync(command, { stdio: 'inherit' });
}

/**
 * Build the frontend and Electron main process, then package everything into a
 * distributable app using electron-builder.
 *
 * Output is written to dist/electron/:
 *   - dist/electron/*.dmg        (macOS — arm64 + x64 universal)
 *   - dist/electron/*.exe        (Windows — NSIS installer)
 *   - dist/electron/*.AppImage   (Linux)
 *
 * The backend is NOT bundled. For production, set the API_URL Vite env variable
 * at build time so the packaged frontend knows where to reach the backend:
 *
 *   API_URL=https://api.yourcompany.com yarn build:electron
 *
 * macOS code signing:
 *   Set CSC_LINK and CSC_KEY_PASSWORD env vars (Developer ID Application cert).
 *   For notarization also set APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, APPLE_TEAM_ID.
 *
 * Usage: yarn build:electron
 */
function main(): void {
  // 1. Generate tray / app icons into electron/assets/
  runCommand('npx tsx scripts/generateElectronIcons.ts');

  // 2. Build the React frontend
  runCommand('nx run frontend:build');

  // 3. Compile Electron main + preload TypeScript
  runCommand('tsc -p electron/tsconfig.json');

  // 4. Package with electron-builder
  //    frontend/dist/ is bundled via extraResources → app/resources/frontend-dist/
  runCommand('npx electron-builder --config electron/electron-builder.json');

  console.log('\n✅ Electron app packaged to dist/electron/\n');
}

main();
