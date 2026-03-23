#!/usr/bin/env npx tsx

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

/**
 * Helper to execute shell commands with visible output.
 */
function runCommand(command: string): void {
  console.log(`\n🚀 Running: ${command}\n`);
  execSync(command, { stdio: 'inherit', cwd: ROOT });
}

/**
 * In dev mode the generic Electron.app binary is used, so macOS permission
 * prompts show "Electron" instead of "Vonage Video". To fix this we patch the
 * Info.plist of the local Electron.app copy so that:
 *  - CFBundleName / CFBundleDisplayName show "Vonage Video"
 *  - NSCameraUsageDescription / NSMicrophoneUsageDescription show our custom text
 *
 * NOTE: We intentionally do NOT change CFBundleIdentifier. The Electron binary
 * is code-signed by GitHub as "com.github.electron". macOS TCC (Privacy &
 * Security) verifies the code signature to identify apps — if the plist bundle
 * ID doesn't match the signature, TCC cannot register the app and it will never
 * appear in the Screen Recording list. Keeping the original bundle ID lets TCC
 * correctly track "Electron" (com.github.electron) for screen recording, camera,
 * and microphone permissions in dev mode.
 *
 * After patching, the app bundle is re-registered with Launch Services so that
 * macOS picks up the new display name immediately (no restart required).
 *
 * This only modifies the copy inside node_modules — it does not affect the
 * packaged app (which gets the correct values from electron-builder).
 * The patch is idempotent: re-running it when already patched is a no-op.
 */
function patchElectronAppName(): void {
  if (process.platform !== 'darwin') return; // macOS only; Windows/Linux use exe name

  const plistPath = path.join(ROOT, 'node_modules/electron/dist/Electron.app/Contents/Info.plist');
  const appPath = path.join(ROOT, 'node_modules/electron/dist/Electron.app');

  if (!fs.existsSync(plistPath)) {
    console.warn('⚠️  Could not find Electron.app Info.plist — skipping name patch');
    return;
  }

  const PRODUCT_NAME = 'Vonage Video';
  const CAMERA_DESC = 'Vonage Video needs camera access for video calls.';
  const MIC_DESC = 'Vonage Video needs microphone access for audio in calls.';
  const SCREEN_DESC = 'Vonage Video needs screen recording access for screen sharing.';

  let plist = fs.readFileSync(plistPath, 'utf8');

  // Check specifically for CFBundleDisplayName being set to our product name.
  // A broader check (e.g. any occurrence of the name string) could cause false
  // positives if only one key was patched in a previous run.
  const alreadyPatched = new RegExp(
    `<key>CFBundleDisplayName</key>\\s*<string>${PRODUCT_NAME}</string>`
  ).test(plist);
  if (alreadyPatched) {
    console.log(`  ✅ Electron.app already patched for "${PRODUCT_NAME}" — skipping\n`);
    return;
  }

  const patch = (key: string, value: string): void => {
    const re = new RegExp(`<key>${key}</key>\\s*<string>[^<]*</string>`);
    if (re.test(plist)) {
      plist = plist.replace(re, `<key>${key}</key>\n\t<string>${value}</string>`);
    } else {
      // Key missing — insert before closing </dict>
      plist = plist.replace(
        '</dict>\n</plist>',
        `\t<key>${key}</key>\n\t<string>${value}</string>\n</dict>\n</plist>`
      );
    }
  };

  patch('CFBundleName', PRODUCT_NAME);
  patch('CFBundleDisplayName', PRODUCT_NAME);
  // CFBundleIdentifier is intentionally left as-is (com.github.electron).
  // See comment on patchElectronAppName() above for the reason.
  patch('NSCameraUsageDescription', CAMERA_DESC);
  patch('NSMicrophoneUsageDescription', MIC_DESC);
  patch('NSScreenCaptureDescription', SCREEN_DESC);
  // Electron 39+ on macOS 14.2+ requires audio capture description for
  // desktopCapturer (CoreAudio Tap API).
  patch(
    'NSAudioCaptureUsageDescription',
    'Vonage Video needs audio capture access for screen sharing with audio.'
  );

  fs.writeFileSync(plistPath, plist, 'utf8');

  // Replace the bundle icon with our custom Vonage icon.
  // macOS About panel reads from electron.icns inside the bundle — iconPath in
  // setAboutPanelOptions() is unreliable in dev mode, so we replace the source.
  const icnsSource = path.join(ROOT, 'electron/assets/app-icon.icns');
  const icnsDest = path.join(appPath, 'Contents/Resources/electron.icns');
  const pngSource = path.join(ROOT, 'electron/assets/app-icon.png');
  const iconset = path.join(ROOT, 'electron/assets/AppIcon.iconset');

  try {
    if (!fs.existsSync(icnsSource) && fs.existsSync(pngSource)) {
      // Build the iconset from the PNG using sips + iconutil (macOS built-ins)
      fs.mkdirSync(iconset, { recursive: true });
      for (const size of [16, 32, 64, 128, 256, 512]) {
        execSync(
          `sips -z ${size} ${size} "${pngSource}" --out "${iconset}/icon_${size}x${size}.png"`,
          { stdio: 'ignore' }
        );
        execSync(
          `sips -z ${size * 2} ${size * 2} "${pngSource}" --out "${iconset}/icon_${size}x${size}@2x.png"`,
          { stdio: 'ignore' }
        );
      }
      execSync(`iconutil -c icns "${iconset}" -o "${icnsSource}"`, { stdio: 'ignore' });
    }
    if (fs.existsSync(icnsSource)) {
      fs.copyFileSync(icnsSource, icnsDest);
    }
  } catch {
    console.warn('  ⚠️  Could not replace bundle icon — About panel may show Electron atom');
  }

  // Touch the app bundle so macOS re-reads the metadata cache
  const now = new Date();
  fs.utimesSync(appPath, now, now);

  // Re-register with Launch Services so the new display name takes effect immediately
  try {
    const lsregister =
      '/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister';
    execSync(`"${lsregister}" -f "${appPath}"`, { stdio: 'ignore' });
  } catch {
    // lsregister not critical — continue
  }

  console.log(`  ✅ Electron.app patched → display name "${PRODUCT_NAME}" (bundle ID unchanged)\n`);
}

/**
 * Build the React frontend and compile the Electron main process, then launch
 * the Electron app.
 *
 * The backend is NOT embedded — it runs separately (locally or remotely).
 * The frontend's API_URL defaults to http://localhost:3345 when accessed from
 * localhost, matching the default backend dev port. Override by setting the
 * API_URL Vite env variable before running this script.
 *
 * Usage:
 *   yarn dev:electron               # build & launch (backend must be running separately)
 *   API_URL=https://my.api yarn dev:electron
 */
function main(): void {
  // 1. Patch node_modules Electron.app so macOS shows "Vonage Video" in permission prompts
  console.log('\n🏷️  Patching Electron app name for dev mode…');
  patchElectronAppName();

  // 2. Generate tray / app icons into electron/assets/
  runCommand('npx tsx scripts/generateElectronIcons.ts');

  // 3. Build the React frontend (Vite → frontend/dist/)
  runCommand('npx nx run frontend:build');

  // 4. Compile the Electron main + preload TypeScript (→ electron/dist/)
  runCommand('npx tsc -p electron/tsconfig.json');

  // 5. Launch Electron
  //
  // On macOS we MUST use `open -n` (Launch Services) rather than spawning the
  // Electron binary directly.  macOS TCC (Privacy & Security) attributes
  // permission prompts (camera, microphone, screen recording) to the
  // "responsible process" — which is the top-level app that Launch Services
  // knows about.  If we spawn Electron as a child of node/tsx, TCC attributes
  // the prompts to the parent (e.g. the terminal or claude CLI), whose
  // Info.plist lacks NSCameraUsageDescription / NSMicrophoneUsageDescription,
  // so the prompts either never appear or cause a SIGABRT.
  //
  // `open -n` tells Launch Services to treat Electron.app as a first-class app,
  // so TCC correctly checks Electron.app's Info.plist (which we patched above).
  //
  // Caveat: `open` does not forward environment variables.  We pass the main
  // script path via --args.  ELECTRON_IS_DEV is not needed because main.ts
  // already uses app.isPackaged to detect dev mode.
  console.log('\n⚡ Launching Electron…\n');

  const mainScript = path.resolve(ROOT, 'electron/dist/main.js');

  if (process.platform === 'darwin') {
    const electronApp = path.join(ROOT, 'node_modules/electron/dist/Electron.app');
    const electronProcess = spawn('open', ['-n', '-W', electronApp, '--args', mainScript], {
      stdio: 'inherit',
      cwd: ROOT,
    });

    electronProcess.on('close', (code) => {
      process.exit(code ?? 0);
    });
  } else {
    // Windows / Linux: spawn directly (TCC is macOS-only)
    const electronProcess = spawn('npx', ['electron', mainScript], {
      stdio: 'inherit',
      shell: true,
      cwd: ROOT,
      env: {
        ...process.env,
        ELECTRON_IS_DEV: '1',
      },
    });

    electronProcess.on('close', (code) => {
      process.exit(code ?? 0);
    });
  }
}

main();
