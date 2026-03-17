/* cspell:words mediapipe MEDIAPIPE XNNPACK normalised fileset */
import { useEffect, useRef } from 'react';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default interval (ms) between gesture recognition runs on a video frame. */
const DEFAULT_DETECTION_INTERVAL_MS = 500;

/** Default minimum duration (ms) the Open_Palm gesture must be sustained before triggering. */
const DEFAULT_DETECTION_DURATION_MS = 2000;

/** Default minimum confidence for the Open_Palm gesture to count as a detection. */
const DEFAULT_GESTURE_CONFIDENCE = 0.45;

/** CDN path for the MediaPipe Vision WASM runtime files. */
const MEDIAPIPE_WASM_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm';

/** CDN path for the GestureRecognizer model. */
const GESTURE_RECOGNIZER_MODEL =
  'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Gesture names returned by the MediaPipe GestureRecognizer model. */
type GestureName = 'Open_Palm' | 'Thumb_Up' | 'Thumb_Down';

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
  /** Interval (ms) between gesture recognition runs. Defaults to 500 ms. */
  detectionIntervalMs?: number;
  /** Minimum confidence (0–1) for a gesture to count. Defaults to 0.45. */
  gestureConfidence?: number;
  /** Inference delegate: 'GPU' (WebGL, default) or 'CPU' (XNNPACK). */
  delegate?: 'GPU' | 'CPU';
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Detects when the local user shows an open palm in front of the camera for
 * a configurable duration (default 2 s) and triggers `onHandRaised`.
 *
 * Uses MediaPipe GestureRecognizer running at 2 FPS (every 500 ms) on the
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
}: UseGestureDetectionProps): void => {
  // Stable refs to avoid stale closures inside the interval callback.
  const callbacksRef = useRef({ onHandRaised, onThumbsUp, onThumbsDown });
  callbacksRef.current = { onHandRaised, onThumbsUp, onThumbsDown };

  const recognizerRef = useRef<import('@mediapipe/tasks-vision').GestureRecognizer | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gestureStateRef = useRef<Record<GestureName, GestureState>>({
    Open_Palm: { consecutiveDetections: 0, hasFired: false },
    Thumb_Up: { consecutiveDetections: 0, hasFired: false },
    Thumb_Down: { consecutiveDetections: 0, hasFired: false },
  });
  const isLoadingRef = useRef(false);

  const requiredConsecutiveDetections = Math.max(
    1,
    Math.ceil(detectionDurationMs / detectionIntervalMs)
  );

  useEffect(() => {
    if (!enabled || !videoElement) {
      cleanup();
      return;
    }

    let cancelled = false;

    const start = async () => {
      // Guard: browser must support WebAssembly (required by MediaPipe WASM runtime)
      if (typeof WebAssembly === 'undefined') {
        console.warn('[useGestureDetection] WebAssembly not supported — skipping detection');
        return;
      }

      // Load the recognizer if not already loaded
      if (!recognizerRef.current && !isLoadingRef.current) {
        isLoadingRef.current = true;
        try {
          const { FilesetResolver, GestureRecognizer } = await import('@mediapipe/tasks-vision');

          if (cancelled) return;

          const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_CDN);

          if (cancelled) return;

          recognizerRef.current = await GestureRecognizer.createFromModelPath(
            vision,
            GESTURE_RECOGNIZER_MODEL
          );

          await recognizerRef.current.setOptions({
            baseOptions: { delegate },
            runningMode: 'VIDEO',
            numHands: 1,
          });
        } catch (err) {
          console.warn('[useGestureDetection] Failed to load GestureRecognizer:', err);
          isLoadingRef.current = false;
          return;
        }
        isLoadingRef.current = false;
      }

      if (cancelled || !recognizerRef.current) return;

      // Reset detection state for all gestures
      resetGestureState();

      // Start the detection loop
      intervalRef.current = setInterval(() => {
        const recognizer = recognizerRef.current;
        if (!recognizer || !videoElement || videoElement.readyState < 2) {
          return;
        }

        try {
          const result = recognizer.recognizeForVideo(videoElement, performance.now());
          const detected = detectGesture(result, gestureConfidence);
          const state = gestureStateRef.current;
          const callbacks = callbacksRef.current;

          // Map gesture names to their callbacks
          const gestureCallbacks: Record<GestureName, (() => void) | undefined> = {
            Open_Palm: callbacks.onHandRaised,
            Thumb_Up: callbacks.onThumbsUp,
            Thumb_Down: callbacks.onThumbsDown,
          };

          for (const gesture of Object.keys(state) as GestureName[]) {
            if (detected === gesture) {
              state[gesture].consecutiveDetections += 1;
              const cb = gestureCallbacks[gesture];
              if (
                state[gesture].consecutiveDetections >= requiredConsecutiveDetections &&
                !state[gesture].hasFired &&
                cb
              ) {
                state[gesture].hasFired = true;
                cb();
              }
            } else {
              state[gesture].consecutiveDetections = 0;
              state[gesture].hasFired = false;
            }
          }
        } catch (err) {
          console.warn('[useGestureDetection] Frame processing error:', err);
        }
      }, detectionIntervalMs);
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
  }

  function cleanup() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    resetGestureState();

    // Dispose the model to free memory when detection is disabled
    if (recognizerRef.current) {
      recognizerRef.current.close();
      recognizerRef.current = null;
    }
    isLoadingRef.current = false;
  }
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
