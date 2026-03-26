/**
 * Shared AudioContext singleton with reference counting.
 *
 * Browsers limit the number of concurrent AudioContext instances (Safari caps at 4).
 * Instead of creating one context per subscriber, all spatial-audio consumers share
 * a single context. The context is lazily created on first `acquire()` and closed
 * when the last consumer calls `release()`.
 */

let sharedContext: AudioContext | null = null;
let refCount = 0;

/**
 * Returns the shared AudioContext, creating it if necessary.
 * Each caller must pair this with a `releaseSharedAudioContext()` call when done.
 */
export function acquireSharedAudioContext(): AudioContext {
  if (!sharedContext || sharedContext.state === 'closed') {
    sharedContext = new AudioContext();
    refCount = 0;
  }
  refCount += 1;
  return sharedContext;
}

/**
 * Decrements the reference count and closes the AudioContext when no consumers remain.
 */
export function releaseSharedAudioContext(): void {
  refCount -= 1;
  if (refCount <= 0) {
    refCount = 0;
    if (sharedContext && sharedContext.state !== 'closed') {
      void sharedContext.close();
    }
    sharedContext = null;
  }
}

/**
 * Returns the current reference count (for testing).
 */
export function getSharedAudioContextRefCount(): number {
  return refCount;
}

/**
 * Resets the shared state (for testing only).
 */
export function resetSharedAudioContext(): void {
  if (sharedContext && sharedContext.state !== 'closed') {
    void sharedContext.close();
  }
  sharedContext = null;
  refCount = 0;
}
