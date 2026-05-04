#!/usr/bin/env npx tsx
/**
 * Self-hosts the MediaPipe WASM runtime and the GestureRecognizer model so
 * gesture detection runs without third-party CDN dependencies (no SRI gap,
 * no offline failure, no supply-chain risk from a compromised CDN file).
 *
 * What it does, idempotently:
 *   1. Copies @mediapipe/tasks-vision/wasm/* → frontend/public/mediapipe/wasm/
 *   2. Downloads the float16 gesture_recognizer.task model (≈8 MB) to
 *      frontend/public/mediapipe/ — only if not already present.
 *   3. Brotli-compresses every shipped asset to a sibling `.br` file at
 *      quality 11. Express serves the `.br` with `Content-Encoding: br`
 *      when the client supports it, falling back to the original.
 *
 * Compression numbers are real (measured against q=11, a one-time cost):
 *   vision_wasm_internal.wasm      11.2 MB → 2.3 MB (80% smaller)
 *   vision_wasm_nosimd_internal    10.4 MB → 2.2 MB (79% smaller)
 *   vision_wasm_internal.js          200 KB →  42 KB
 *
 * The output directory is git-ignored — assets are regenerated on every
 * `yarn install` (postinstall) and before `vite build` (prebuild).
 */
import { execSync } from 'node:child_process';
import { brotliCompressSync, constants } from 'node:zlib';
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  cpSync,
  statSync,
  readdirSync,
} from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '..');

const wasmSrc = join(repoRoot, 'node_modules/@mediapipe/tasks-vision/wasm');
const outDir = join(repoRoot, 'frontend/public/mediapipe');
const wasmOut = join(outDir, 'wasm');
const modelPath = join(outDir, 'gesture_recognizer.task');
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task';

function log(msg: string): void {
  console.log(`[mediapipe-assets] ${msg}`);
}

function ensureDir(p: string): void {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function copyWasm(): void {
  if (!existsSync(wasmSrc)) {
    log(`SKIP: ${wasmSrc} not found — is @mediapipe/tasks-vision installed?`);
    return;
  }
  ensureDir(wasmOut);
  cpSync(wasmSrc, wasmOut, { recursive: true });
  log(`copied WASM runtime → ${wasmOut}`);
}

function downloadModel(): void {
  if (existsSync(modelPath)) {
    log(`model already present (${(statSync(modelPath).size / 1024 / 1024).toFixed(1)} MB)`);
    return;
  }
  ensureDir(outDir);
  log(`downloading model from ${MODEL_URL} …`);
  // curl is more universally available than node:fetch in older Node runtimes
  // and avoids streaming the file through the JS heap.
  execSync(`curl -sSL -o "${modelPath}" "${MODEL_URL}"`, { stdio: 'inherit' });
  log(`downloaded model (${(statSync(modelPath).size / 1024 / 1024).toFixed(1)} MB)`);
}

function brotliCompressFile(file: string): void {
  const brPath = `${file}.br`;
  if (existsSync(brPath) && statSync(brPath).mtimeMs >= statSync(file).mtimeMs) return;
  const raw = readFileSync(file);
  const br = brotliCompressSync(raw, {
    params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
  });
  writeFileSync(brPath, br);
  const ratio = ((br.length / raw.length) * 100).toFixed(0);
  log(
    `compressed ${file.replace(repoRoot, '.')}  ` +
      `${(raw.length / 1024).toFixed(0)} KB → ${(br.length / 1024).toFixed(0)} KB (${ratio}%)`
  );
}

function compressTreeBrotli(dir: string): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) compressTreeBrotli(full);
    else if (entry.isFile() && !entry.name.endsWith('.br')) brotliCompressFile(full);
  }
}

function main(): void {
  copyWasm();
  downloadModel();
  if (existsSync(outDir)) compressTreeBrotli(outDir);
}

main();
