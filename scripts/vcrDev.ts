#!/usr/bin/env node
import { execSync } from 'child_process';

/**
 * Builds and deploys the backend to VCR dev instance.
 * Runs vcrBuild.dev.sh, then deploys using vcr CLI.
 * Auth is always off: a personal instance has no registered redirect URI or cookie secret. The
 * line appended to the bundled .env wins over the one copied from backend/.env.
 */
function runDeploy() {
  console.log('Deploying to VCR dev instance (auth off)...');
  execSync(
    'AUTH_ENABLED=false bash vcrBuild.dev.sh && printf "\\nAUTH_ENABLED=\'false\'\\n" >> ./backend/dist/.env && cd ./backend/dist && vcr deploy -f vcr-dev.yml && cd ../..',
    { stdio: 'inherit' }
  );
}

/**
 * Removes the VCR dev instance for this project.
 * Uses vcr CLI to remove the vera-dev instance.
 */
function runRemove() {
  console.log('Removing VCR dev instance...');
  execSync('vcr instance rm --project-name vonage-video-react-app --instance-name vera-dev', {
    stdio: 'inherit',
  });
}

/**
 * Main entry point for VCR dev instance management.
 *
 * Modes:
 * - No args: Deploy to VCR dev instance
 * - rm/--rm: Remove VCR dev instance
 *
 * Usage:
 * - yarn vcr:dev        (deploy)
 * - yarn vcr:dev rm     (remove)
 */
function main() {
  const args = process.argv.slice(2);
  const mode = args[0];

  const isRemoveMode = mode === 'rm' || mode === '--rm';

  if (isRemoveMode) {
    runRemove();
    return;
  }

  runDeploy();
}

main();
