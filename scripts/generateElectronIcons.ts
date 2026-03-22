#!/usr/bin/env npx tsx
/**
 * generateElectronIcons.ts
 *
 * Generates the PNG / ICNS icon files used by the Electron tray and app window,
 * using the actual Vonage V mark extracted from the official SVG logo
 * (frontend/public/images/vonage-logo-desktop.svg).
 *
 * Rendering is done via macOS's built-in `sips` utility (no extra dependencies).
 *
 * Output:
 *   electron/assets/tray-icon.png           32×32   (Windows / Linux — white bg + black V)
 *   electron/assets/tray-icon@2x.png        64×64   (Windows / Linux HiDPI)
 *   electron/assets/tray-template.png       16×16   (macOS — black V on transparent, template)
 *   electron/assets/tray-template@2x.png    32×32   (macOS Retina)
 *   electron/assets/app-icon.png           512×512  (app window icon / electron-builder)
 *   electron/assets/app-icon.icns                   (macOS bundle icon — replaces electron.icns)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ASSETS = path.resolve(__dirname, '../electron/assets');

// ─── Vonage V mark paths ──────────────────────────────────────────────────────
//
// Extracted verbatim from frontend/public/images/vonage-logo-desktop.svg.
// Original viewBox: 0 0 1000 400.  The V mark occupies roughly:
//   x: 58.7 – 276.8   (width ≈ 218)
//   y: 74   – 264     (height ≈ 190)
//
// We crop to a square viewBox centred on the mark with ~20 % padding:
//   "15 16 306 306"
//
const V_PATH_1 = 'M101.8,74H58.7l61.5,139.7c0.5,1.1,2,1.1,2.4,0l20.4-48.1L101.8,74z';
const V_PATH_2 =
  'M233,74c0,0-66,151.2-74.9,165.2c-10.3,16.2-17.1,22.4-29.7,24.4' +
  'c-0.1,0-0.2,0.1-0.2,0.2c0,0.1,0.1,0.2,0.2,0.2h39.5' +
  'c17.1,0,29.4-14.3,36.3-26.9C211.9,222.9,276.8,74,276.8,74H233z';

const VIEWBOX = '15 16 306 306';

// ─── SVG builders ─────────────────────────────────────────────────────────────

/** White-background icon (app icon, Windows/Linux tray). */
function svgWhiteBg(): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}">` +
    `<rect fill="#ffffff" x="15" y="16" width="306" height="306"/>` +
    `<path fill="#0A0203" d="${V_PATH_1}"/>` +
    `<path fill="#0A0203" d="${V_PATH_2}"/>` +
    `</svg>`
  );
}

/** Transparent-background icon (macOS tray template — system inverts for dark mode). */
function svgTransparent(): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}">` +
    `<path fill="#000000" d="${V_PATH_1}"/>` +
    `<path fill="#000000" d="${V_PATH_2}"/>` +
    `</svg>`
  );
}

// ─── Rendering helpers ────────────────────────────────────────────────────────

/**
 * Write an SVG string to a temp file, convert it to PNG at the requested
 * pixel size using macOS `sips`, then delete the temp SVG.
 */
function svgToPng(svgContent: string, destPng: string, size: number): void {
  const tmp = destPng.replace(/\.png$/, '__tmp.svg');
  fs.writeFileSync(tmp, svgContent, 'utf8');
  execSync(`sips -s format png -z ${size} ${size} "${tmp}" --out "${destPng}"`, {
    stdio: 'ignore',
  });
  fs.unlinkSync(tmp);
}

/**
 * Build an .icns from a 512×512 source PNG using sips + iconutil.
 * Writes to `destIcns`.
 */
function buildIcns(srcPng: string, destIcns: string): void {
  const iconsetDir = path.join(ASSETS, 'AppIcon.iconset');
  fs.mkdirSync(iconsetDir, { recursive: true });

  for (const size of [16, 32, 64, 128, 256, 512]) {
    execSync(`sips -z ${size} ${size} "${srcPng}" --out "${iconsetDir}/icon_${size}x${size}.png"`, {
      stdio: 'ignore',
    });
    execSync(
      `sips -z ${size * 2} ${size * 2} "${srcPng}" --out "${iconsetDir}/icon_${size}x${size}@2x.png"`,
      { stdio: 'ignore' }
    );
  }

  execSync(`iconutil -c icns "${iconsetDir}" -o "${destIcns}"`, { stdio: 'ignore' });
  // Keep the iconset for potential future use — it's cheap disk space.
}

// ─── Main ──────────────────────────────────────────────────────────────────────

function main(): void {
  fs.mkdirSync(ASSETS, { recursive: true });

  const report = (label: string, file: string) => {
    const size = fs.statSync(file).size;
    console.log(`  ✅ ${label.padEnd(28)} ${size.toLocaleString()} bytes`);
  };

  console.log('\n🎨 Generating Electron icons (Vonage V mark)…\n');

  // ── App icon (white background, 512 px) ──────────────────────────────────
  const appIconPng = path.join(ASSETS, 'app-icon.png');
  svgToPng(svgWhiteBg(), appIconPng, 512);
  report('app-icon.png', appIconPng);

  // ── macOS .icns bundle icon ───────────────────────────────────────────────
  if (process.platform === 'darwin') {
    const appIconIcns = path.join(ASSETS, 'app-icon.icns');
    buildIcns(appIconPng, appIconIcns);
    report('app-icon.icns', appIconIcns);

    // Also replace the dev Electron.app bundle icon so the About panel and
    // Dock use the Vonage logo even before packaging.
    const bundleIcns = path.join(
      ROOT,
      'node_modules/electron/dist/Electron.app/Contents/Resources/electron.icns'
    );
    if (fs.existsSync(path.dirname(bundleIcns))) {
      fs.copyFileSync(appIconIcns, bundleIcns);
      console.log('  ✅ Replaced Electron bundle icon (dev mode)\n');
    }
  }

  // ── Tray — colored (Windows / Linux) ────────────────────────────────────
  const trayPng = path.join(ASSETS, 'tray-icon.png');
  const tray2xPng = path.join(ASSETS, 'tray-icon@2x.png');
  svgToPng(svgWhiteBg(), trayPng, 32);
  svgToPng(svgWhiteBg(), tray2xPng, 64);
  report('tray-icon.png', trayPng);
  report('tray-icon@2x.png', tray2xPng);

  // ── Tray — macOS template (black on transparent) ─────────────────────────
  const trayTpl = path.join(ASSETS, 'tray-template.png');
  const trayTpl2x = path.join(ASSETS, 'tray-template@2x.png');
  svgToPng(svgTransparent(), trayTpl, 16);
  svgToPng(svgTransparent(), trayTpl2x, 32);
  report('tray-template.png', trayTpl);
  report('tray-template@2x.png', trayTpl2x);

  console.log('\nDone.\n');
}

main();
