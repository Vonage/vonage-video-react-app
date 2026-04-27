/* cspell:words mediapipe MEDIAPIPE XNNPACK normalised fileset */
import { useEffect, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default interval (ms) between gesture recognition runs on a video frame (4 FPS). */
const DEFAULT_DETECTION_INTERVAL_MS = 250;

/** Default minimum duration (ms) the Open_Palm gesture must be sustained before triggering. */
const DEFAULT_DETECTION_DURATION_MS = 2000;

/** Default minimum confidence for the Open_Palm gesture to count as a detection. */
const DEFAULT_GESTURE_CONFIDENCE = 0.45;

/**
 * Default number of recent frames inspected when checking whether the hand is waving.
 * At the default 4 FPS this is ~1.5 s of motion history.
 */
const DEFAULT_WAVE_WINDOW_FRAMES = 6;

/**
 * Default lateral motion threshold (in normalized image-x units, range 0–1).
 * If the wrist's x-coordinate range across the wave window exceeds this value,
 * the hand is considered to be waving and Open_Palm detection is suppressed.
 * 0.10 ≈ 10% of frame width.
 */
const DEFAULT_WAVE_RANGE_THRESHOLD = 0.1;

/** CDN path for the MediaPipe Vision WASM runtime files. */
const MEDIAPIPE_WASM_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm';

/** CDN path for the GestureRecognizer model. */
const GESTURE_RECOGNIZER_MODEL =
  'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Gesture names returned by the MediaPipe GestureRecognizer model. */
export type GestureName = 'Open_Palm' | 'Thumb_Up' | 'Thumb_Down';

/** Maps each tracked gesture to the emoji shown in the progress ring. */
export const GESTURE_EMOJI_MAP: Record<GestureName, string> = {
  Open_Palm: '✋',
  Thumb_Up: '👍',
  Thumb_Down: '👎',
};

/** Progress state exposed to the UI for rendering the progress ring. */
export type GestureProgress = {
  /** Which gesture is currently being detected. */
  gesture: GestureName;
  /** Whether the gesture is still being detected or has completed (fired). */
  state: 'detecting' | 'completed';
  /** Total duration (ms) for the ring fill animation. */
  durationMs: number;
} | null;

export type UseGestureDetectionProps = {
  /** Whether detection is enabled (feature flag + user opt-in + hand not already raised + video on + no background effects). */
  enabled: boolean;
  /** The publisher's HTMLVideoElement to analyze. */
  videoElement: HTMLVideoElement | null;
  /** Callback when a raised hand (Open_Palm) is detected. */
  onHandRaised: () => void;
  /** Callback when a Thumb_Up gesture is detected. */
  onThumbsUp?: () => void;
  /** Callback when a Thumb_Down gesture is detected. */
  onThumbsDown?: () => void;
  /** Minimum duration (ms) the gesture must be sustained before triggering. Defaults to 2 000 ms. */
  detectionDurationMs?: number;
  /** Interval (ms) between gesture recognition runs. Defaults to 250 ms. */
  detectionIntervalMs?: number;
  /** Minimum confidence (0–1) for a gesture to count. Defaults to 0.45. */
  gestureConfidence?: number;
  /** Inference delegate: 'GPU' (WebGL, default) or 'CPU' (XNNPACK). */
  delegate?: 'GPU' | 'CPU';
  /**
   * Number of recent frames inspected when deciding whether the hand is waving.
   * Larger values demand a longer, steadier hold; smaller values react sooner
   * but may miss slow waves. Defaults to 6 (~1.5 s at 4 FPS).
   */
  waveWindowFrames?: number;
  /**
   * Lateral motion threshold for the wave detector, in normalized image-x units (0–1).
   * If the wrist's x-coordinate range across `waveWindowFrames` exceeds this value,
   * Open_Palm detection is suppressed (treated as a wave). Defaults to 0.1 (~10% of frame width).
   * Set to a value > 1 to effectively disable wave suppression.
   */
  waveRangeThreshold?: number;
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Detects when the local user shows an open palm in front of the camera for
 * a configurable duration (default 2 s) and triggers `onHandRaised`.
 *
 * Uses MediaPipe GestureRecognizer running at 4 FPS (every 250 ms) on the
 * publisher's video element. The model is lazy-loaded from CDN when `enabled`
 * first becomes true, and disposed when `enabled` becomes false to free memory.
 *
 * Detection criteria:
 * - Gesture classified as `Open_Palm` with confidence ≥ configurable threshold (default 0.45)
 */
/** Per-gesture tracking state for sustained detection. */
type GestureState = {
  consecutiveDetections: number;
  hasFired: boolean;
};

const useGestureDetection = ({
  enabled,
  videoElement,
  onHandRaised,
  onThumbsUp,
  onThumbsDown,
  detectionDurationMs = DEFAULT_DETECTION_DURATION_MS,
  detectionIntervalMs = DEFAULT_DETECTION_INTERVAL_MS,
  gestureConfidence = DEFAULT_GESTURE_CONFIDENCE,
  delegate = 'GPU',
  waveWindowFrames = DEFAULT_WAVE_WINDOW_FRAMES,
  waveRangeThreshold = DEFAULT_WAVE_RANGE_THRESHOLD,
}: UseGestureDetectionProps): GestureProgress => {
  // Stable refs to avoid stale closures inside the interval callback.
  const callbacksRef = useRef({ onHandRaised, onThumbsUp, onThumbsDown });
  callbacksRef.current = { onHandRaised, onThumbsUp, onThumbsDown };

  // Tunable options held in a ref so prop changes are picked up by the interval
  // callback without restarting the model load / detection loop.
  const optionsRef = useRef({
    delegate,
    detectionIntervalMs,
    detectionDurationMs,
    gestureConfidence,
    waveWindowFrames,
    waveRangeThreshold,
  });
  optionsRef.current = {
    delegate,
    detectionIntervalMs,
    detectionDurationMs,
    gestureConfidence,
    waveWindowFrames,
    waveRangeThreshold,
  };

  const recognizerRef = useRef<import('@mediapipe/tasks-vision').GestureRecognizer | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gestureStateRef = useRef<Record<GestureName, GestureState>>({
    Open_Palm: { consecutiveDetections: 0, hasFired: false },
    Thumb_Up: { consecutiveDetections: 0, hasFired: false },
    Thumb_Down: { consecutiveDetections: 0, hasFired: false },
  });
  const isLoadingRef = useRef(false);
  const completionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Rolling history of wrist-x positions used by the wave detector. */
  const wristXHistoryRef = useRef<number[]>([]);

  const [gestureProgress, setGestureProgress] = useState<GestureProgress>(null);

  const requiredConsecutiveDetections = Math.max(
    1,
    Math.ceil(detectionDurationMs / detectionIntervalMs)
  );

  // Helpers below close over refs/state setters defined above.

  /** Load and configure the GestureRecognizer model. Returns true on success. */
  const loadRecognizer = async (cancelled: () => boolean): Promise<boolean> => {
    if (recognizerRef.current || isLoadingRef.current) return !!recognizerRef.current;

    isLoadingRef.current = true;
    try {
      const { FilesetResolver, GestureRecognizer } = await import('@mediapipe/tasks-vision');
      if (cancelled()) return false;

      const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_CDN);
      if (cancelled()) return false;

      const recognizer = await GestureRecognizer.createFromModelPath(
        vision,
        GESTURE_RECOGNIZER_MODEL
      );
      await recognizer.setOptions({
        baseOptions: { delegate: optionsRef.current.delegate },
        runningMode: 'VIDEO',
        numHands: 1,
      });
      recognizerRef.current = recognizer;
      return true;
    } catch (err) {
      console.warn('[useGestureDetection] Failed to load GestureRecognizer:', err);
      return false;
    } finally {
      isLoadingRef.current = false;
    }
  };

  /** Advance state for a single gesture for the current tick. Returns true if this gesture is actively being detected. */
  const advanceGestureState = (
    gesture: GestureName,
    detected: GestureName | null,
    gestureCallbacks: Record<GestureName, (() => void) | undefined>,
    currentDurationMs: number
  ): boolean => {
    const state = gestureStateRef.current;
    if (detected !== gesture) {
      state[gesture].consecutiveDetections = 0;
      state[gesture].hasFired = false;
      return false;
    }

    if (state[gesture].consecutiveDetections === 0) {
      setGestureProgress({ gesture, state: 'detecting', durationMs: currentDurationMs });
    }
    state[gesture].consecutiveDetections += 1;

    const cb = gestureCallbacks[gesture];
    const sustained = state[gesture].consecutiveDetections >= requiredConsecutiveDetections;
    if (sustained && !state[gesture].hasFired && cb) {
      state[gesture].hasFired = true;
      cb();
      setGestureProgress({ gesture, state: 'completed', durationMs: currentDurationMs });
      completionTimeoutRef.current = setTimeout(() => setGestureProgress(null), 400);
    }
    return true;
  };

  /**
   * Tracks the wrist's x-coordinate over a rolling window and decides whether
   * the hand is currently waving (large lateral motion). Used to suppress
   * Open_Palm detection during a wave-goodbye gesture.
   */
  const isHandWaving = (
    result: import('@mediapipe/tasks-vision').GestureRecognizerResult
  ): boolean => {
    const wristX = result.landmarks?.[0]?.[0]?.x;
    const history = wristXHistoryRef.current;

    if (typeof wristX !== 'number') {
      // No hand detected this frame — clear the history so we start fresh next time.
      history.length = 0;
      return false;
    }

    history.push(wristX);
    const windowSize = Math.max(2, optionsRef.current.waveWindowFrames);
    while (history.length > windowSize) history.shift();

    if (history.length < windowSize) return false;

    const range = Math.max(...history) - Math.min(...history);
    return range > optionsRef.current.waveRangeThreshold;
  };

  /** Run one detection tick on the current video frame. */
  const runDetectionTick = (videoEl: HTMLVideoElement) => {
    const recognizer = recognizerRef.current;
    if (!recognizer || videoEl.readyState < 2) return;

    try {
      const result = recognizer.recognizeForVideo(videoEl, performance.now());
      const detected = detectGesture(result, optionsRef.current.gestureConfidence);
      // Suppress Open_Palm detection while the hand is waving (e.g., goodbye wave).
      const effectiveDetected = detected === 'Open_Palm' && isHandWaving(result) ? null : detected;
      const callbacks = callbacksRef.current;
      const currentDurationMs = optionsRef.current.detectionDurationMs;

      const gestureCallbacks: Record<GestureName, (() => void) | undefined> = {
        Open_Palm: callbacks.onHandRaised,
        Thumb_Up: callbacks.onThumbsUp,
        Thumb_Down: callbacks.onThumbsDown,
      };

      const anyActive = (Object.keys(gestureStateRef.current) as GestureName[]).reduce(
        (active, gesture) =>
          advanceGestureState(gesture, effectiveDetected, gestureCallbacks, currentDurationMs) ||
          active,
        false
      );

      if (!anyActive) setGestureProgress(null);
    } catch (err) {
      console.warn('[useGestureDetection] Frame processing error:', err);
    }
  };

  useEffect(() => {
    if (!enabled || !videoElement) {
      cleanup();
      return;
    }

    // Guard: browser must support WebAssembly (required by MediaPipe WASM runtime)
    if (typeof WebAssembly === 'undefined') {
      console.warn('[useGestureDetection] WebAssembly not supported — skipping detection');
      return;
    }

    let cancelled = false;
    const isCancelled = () => cancelled;

    const start = async () => {
      const loaded = await loadRecognizer(isCancelled);
      if (cancelled || !loaded) return;

      resetGestureState();
      intervalRef.current = setInterval(
        () => runDetectionTick(videoElement),
        optionsRef.current.detectionIntervalMs
      );
    };

    void start();

    return () => {
      cancelled = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, videoElement, requiredConsecutiveDetections]);

  function resetGestureState() {
    for (const gesture of Object.keys(gestureStateRef.current) as GestureName[]) {
      gestureStateRef.current[gesture].consecutiveDetections = 0;
      gestureStateRef.current[gesture].hasFired = false;
    }
    wristXHistoryRef.current.length = 0;
  }

  function cleanup() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = null;
    }
    resetGestureState();
    setGestureProgress(null);

    // Dispose the model to free memory when detection is disabled
    if (recognizerRef.current) {
      recognizerRef.current.close();
      recognizerRef.current = null;
    }
    isLoadingRef.current = false;
  }

  return gestureProgress;
};

// ---------------------------------------------------------------------------
// Detection logic
// ---------------------------------------------------------------------------

/** Gestures we track from the MediaPipe model. */
const TRACKED_GESTURES: ReadonlySet<string> = new Set<GestureName>([
  'Open_Palm',
  'Thumb_Up',
  'Thumb_Down',
]);

/**
 * Returns the detected {@link GestureName} if the top gesture is one we track
 * and meets the confidence threshold, or `null` otherwise.
 *
 * We rely on gesture classification (sustained for a configurable duration)
 * rather than wrist position. MediaPipe's normalised wrist y-coordinates are
 * unreliable in typical video-call framing (head + shoulders).
 */
function detectGesture(
  result: import('@mediapipe/tasks-vision').GestureRecognizerResult,
  gestureConfidence: number
): GestureName | null {
  const { gestures } = result;

  if (!gestures?.length) {
    return null;
  }

  const topGesture = gestures[0]?.[0];
  if (!topGesture) return null;

  if (topGesture.score >= gestureConfidence && TRACKED_GESTURES.has(topGesture.categoryName)) {
    return topGesture.categoryName as GestureName;
  }

  return null;
}

export default useGestureDetection;
