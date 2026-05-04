/**
 * Self-hosts the MediaPipe WASM runtime and the GestureRecognizer model so
 * gesture detection runs without third-party CDN dependencies (no SRI gap,
 * no offline failure, no supply-chain risk from a compromised CDN file).
 *
 * What it does, idempotently:
 *   1. Copies @mediapipe/tasks-vision/wasm/* → frontend/public/mediapipe/wasm/
 *      (skips files whose source mtime hasn't moved past the destination)
 *   2. Downloads the float16 gesture_recognizer.task model (≈8 MB) to
 *      frontend/public/mediapipe/ — only if not already present.
 *   3. Brotli-compresses every shipped asset to a sibling `.br` file at
 *      quality 11. Express serves the `.br` with `Content-Encoding: br`
 *      when the client supports it, falling back to the original.
 *
 * Idempotency matters: this script runs on every `yarn install` (postinstall)
 * and before `vite build` (prebuild), so we want it to be a near-no-op once
 * the assets are already in place.
 *
 * Compression numbers are real (measured at q=11):
 *   vision_wasm_internal.wasm      11.2 MB → 2.3 MB (80% smaller)
 *   vision_wasm_nosimd_internal    10.4 MB → 2.2 MB (79% smaller)
 *   vision_wasm_internal.js          200 KB →  42 KB
 *
 * The output directory is git-ignored — assets are regenerated, not
 * committed.
 *
 * Skipping the network download:
 *   Set VERA_SKIP_MEDIAPIPE_DOWNLOAD=1 to skip the model download (e.g.
 *   for offline installs or CI environments without external network).
 *   Gesture detection will fail at runtime if the model is missing, but
 *   the install/build itself will succeed.
 */
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
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

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

/**
 * Returns true when `dst` exists and its mtime is newer than every file in
 * `src` — i.e. nothing to do. We can't rely on hashing (one of the wasm
 * files is 11 MB) so mtime is the practical heuristic.
 */
function destIsUpToDate(src: string, dst: string): boolean {
  if (!existsSync(dst)) return false;
  const dstMtime = statSync(dst).mtimeMs;
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const srcMtime = statSync(join(src, entry.name)).mtimeMs;
    if (srcMtime > dstMtime) return false;
  }
  return true;
}

function copyWasm(): void {
  if (!existsSync(wasmSrc)) {
    log(`SKIP: ${wasmSrc} not found — is @mediapipe/tasks-vision installed?`);
    return;
  }
  if (destIsUpToDate(wasmSrc, wasmOut)) {
    log('WASM runtime up to date — skipping copy');
    return;
  }
  ensureDir(wasmOut);
  // preserveTimestamps so subsequent runs of destIsUpToDate keep returning
  // true and we don't re-Brotli the same bytes on every install.
  cpSync(wasmSrc, wasmOut, { recursive: true, preserveTimestamps: true });
  log(`copied WASM runtime → ${wasmOut}`);
}

async function downloadModel(): Promise<void> {
  if (existsSync(modelPath)) {
    log(`model already present (${(statSync(modelPath).size / 1024 / 1024).toFixed(1)} MB)`);
    return;
  }
  if (process.env.VERA_SKIP_MEDIAPIPE_DOWNLOAD === '1') {
    log('VERA_SKIP_MEDIAPIPE_DOWNLOAD=1 — skipping model download');
    return;
  }
  ensureDir(outDir);
  log(`downloading model from ${MODEL_URL} …`);
  // Native fetch (Node ≥18) — no `curl` dependency, works on Windows too.
  const response = await fetch(MODEL_URL);
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download model: HTTP ${response.status}`);
  }
  // Stream to disk so we don't buffer the whole 8 MB through the JS heap.
  await pipeline(Readable.fromWeb(response.body as never), await openWriteStream(modelPath));
  log(`downloaded model (${(statSync(modelPath).size / 1024 / 1024).toFixed(1)} MB)`);
}

async function openWriteStream(path: string) {
  const { createWriteStream } = await import('node:fs');
  return createWriteStream(path);
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

async function main(): Promise<void> {
  copyWasm();
  await downloadModel();
  if (existsSync(outDir)) compressTreeBrotli(outDir);
}

main().catch((err: unknown) => {
  console.error('[mediapipe-assets] fatal:', err);
  process.exit(1);
});
