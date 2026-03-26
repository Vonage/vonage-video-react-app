import { Box } from 'opentok-layout-js';
import { calculatePan } from '../../hooks/useSpatialAudio';

/**
 * Batched pan-update manager using requestAnimationFrame.
 *
 * Instead of each subscriber running its own 150ms debounce timer,
 * all active panners register here and get updated in a single rAF
 * callback. This reduces scheduling overhead from N independent timers
 * to 1 frame-synced loop — most noticeable during window resize with
 * many participants.
 *
 * The loop only runs while at least one panner is registered.
 */

interface PanEntry {
  panner: StereoPannerNode;
  audioContext: AudioContext;
  box: Box;
  containerWidth: number;
  dirty: boolean;
}

const entries = new Map<string, PanEntry>();
let rafId: number | null = null;

function tick() {
  for (const entry of entries.values()) {
    if (!entry.dirty) continue;
    entry.dirty = false;

    const pan = calculatePan(entry.box, entry.containerWidth);
    entry.panner.pan.setValueAtTime(pan, entry.audioContext.currentTime);
  }

  if (entries.size > 0) {
    rafId = requestAnimationFrame(tick);
  } else {
    rafId = null;
  }
}

function startLoop() {
  if (rafId === null && entries.size > 0) {
    rafId = requestAnimationFrame(tick);
  }
}

function stopLoop() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

/**
 * Register a panner node for batched updates.
 * @param id - Unique key (typically subscriber id or a generated key).
 */
export function registerPanner(
  id: string,
  panner: StereoPannerNode,
  audioContext: AudioContext,
  box: Box,
  containerWidth: number
): void {
  entries.set(id, { panner, audioContext, box, containerWidth, dirty: true });
  startLoop();
}

/**
 * Update the layout data for a registered panner and mark it dirty.
 */
export function updatePannerLayout(id: string, box: Box, containerWidth: number): void {
  const entry = entries.get(id);
  if (!entry) return;
  entry.box = box;
  entry.containerWidth = containerWidth;
  entry.dirty = true;
  startLoop();
}

/**
 * Remove a panner from the batch loop.
 */
export function unregisterPanner(id: string): void {
  entries.delete(id);
  if (entries.size === 0) {
    stopLoop();
  }
}

/**
 * Returns the number of registered panners (for testing).
 */
export function getRegisteredPannerCount(): number {
  return entries.size;
}

/**
 * Reset all state (for testing only).
 */
export function resetPanManager(): void {
  stopLoop();
  entries.clear();
}
