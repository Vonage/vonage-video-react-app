#!/usr/bin/env npx tsx
/**
 * Diagnose macOS TCC (Transparency, Consent, and Control) permissions
 * for the Electron app.
 *
 * Usage: yarn test:tcc
 *
 * Shows the current permission status for Camera, Microphone, and
 * Screen Recording, and suggests fixes for any issues found.
 */

import { execSync } from 'child_process';

if (process.platform !== 'darwin') {
  console.log('ℹ️  TCC is macOS-only. No permission checks needed on this platform.');
  process.exit(0);
}

console.log('🔍 Checking macOS TCC permissions for Electron…\n');

const bundleIdentifier = 'com.github.electron';

// Check if Electron binary exists
try {
  const electronPath = execSync('npx electron --no-sandbox -e "process.exit(0)" 2>&1', {
    encoding: 'utf-8',
    timeout: 10000,
  });
} catch {
  // Expected — electron exits immediately
}

// Query TCC database for permission status
interface PermissionCheck {
  name: string;
  tccService: string;
  description: string;
}

const permissions: PermissionCheck[] = [
  { name: 'Camera', tccService: 'kTCCServiceCamera', description: 'Video capture' },
  { name: 'Microphone', tccService: 'kTCCServiceMicrophone', description: 'Audio capture' },
  {
    name: 'Screen Recording',
    tccService: 'kTCCServiceScreenCapture',
    description: 'Screen sharing',
  },
];

console.log(`Bundle identifier: ${bundleIdentifier}\n`);
console.log('Permission Status:');
console.log('─'.repeat(60));

let issuesFound = false;

for (const permission of permissions) {
  try {
    // Query the TCC database
    const result = execSync(
      `sqlite3 ~/Library/Application\\ Support/com.apple.TCC/TCC.db "SELECT auth_value FROM access WHERE service='${permission.tccService}' AND client='${bundleIdentifier}'" 2>/dev/null`,
      { encoding: 'utf-8' }
    ).trim();

    let status: string;
    let icon: string;
    if (result === '2') {
      status = 'Granted';
      icon = '✅';
    } else if (result === '0') {
      status = 'Denied';
      icon = '❌';
      issuesFound = true;
    } else if (result === '') {
      status = 'Not requested yet';
      icon = '⚠️';
    } else {
      status = `Unknown (${result})`;
      icon = '❓';
    }

    console.log(
      `  ${icon} ${permission.name.padEnd(20)} ${status.padEnd(20)} (${permission.description})`
    );
  } catch {
    // TCC database might not be readable directly — fall back to general check
    console.log(
      `  ❓ ${permission.name.padEnd(20)} Could not query     (${permission.description})`
    );
  }
}

console.log('─'.repeat(60));

// Check if Electron is in the correct location
const electronBinaryPath = execSync('node -e "console.log(require(\'electron\'))"', {
  encoding: 'utf-8',
}).trim();
console.log(`\nElectron binary: ${electronBinaryPath}`);

// Check Electron version
try {
  const version = execSync('npx electron --version', { encoding: 'utf-8' }).trim();
  console.log(`Electron version: ${version}`);
} catch {
  console.log('Electron version: could not determine');
}

// Check Info.plist patching
try {
  const plistPath = electronBinaryPath.replace(/MacOS\/Electron$/, 'Info.plist');
  const plist = execSync(`cat "${plistPath}" 2>/dev/null`, { encoding: 'utf-8' });

  const hasCamera = plist.includes('NSCameraUsageDescription');
  const hasMic = plist.includes('NSMicrophoneUsageDescription');
  const hasAudio = plist.includes('NSAudioCaptureUsageDescription');
  const bundleName = plist.match(/<key>CFBundleName<\/key>\s*<string>([^<]+)<\/string>/)?.[1];

  console.log(`\nInfo.plist status:`);
  console.log(`  ${hasCamera ? '✅' : '❌'} NSCameraUsageDescription`);
  console.log(`  ${hasMic ? '✅' : '❌'} NSMicrophoneUsageDescription`);
  console.log(`  ${hasAudio ? '✅' : '❌'} NSAudioCaptureUsageDescription`);
  console.log(`  📝 CFBundleName: ${bundleName ?? 'not set'}`);

  if (!hasCamera || !hasMic) {
    issuesFound = true;
    console.log(
      '\n⚠️  Info.plist is not patched. Run "yarn dev:electron" to patch it automatically.'
    );
  }
} catch {
  console.log('\nInfo.plist: could not read');
}

if (issuesFound) {
  console.log('\n📋 To fix permission issues:');
  console.log('   1. Reset permissions: tccutil reset All com.github.electron');
  console.log('   2. Relaunch: yarn dev electron');
  console.log('   3. Grant permissions when prompted');
  console.log('   4. If Screen Recording, toggle it in System Settings then restart the app');
} else {
  console.log('\n✅ All permissions look good!');
}
