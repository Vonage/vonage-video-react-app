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

export type UseHandRaiseDetectionProps = {
  /** Whether detection is enabled (feature flag + user opt-in + hand not already raised + video on + no background effects). */
  enabled: boolean;
  /** The publisher's HTMLVideoElement to analyze. */
  videoElement: HTMLVideoElement | null;
  /** Callback when a raised hand is detected. */
  onHandRaised: () => void;
  /** Minimum duration (ms) the gesture must be sustained before triggering. Defaults to 2 000 ms. */
  detectionDurationMs?: number;
  /** Interval (ms) between gesture recognition runs. Defaults to 500 ms. */
  detectionIntervalMs?: number;
  /** Minimum confidence (0–1) for the Open_Palm gesture to count. Defaults to 0.45. */
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
const useHandRaiseDetection = ({
  enabled,
  videoElement,
  onHandRaised,
  detectionDurationMs = DEFAULT_DETECTION_DURATION_MS,
  detectionIntervalMs = DEFAULT_DETECTION_INTERVAL_MS,
  gestureConfidence = DEFAULT_GESTURE_CONFIDENCE,
  delegate = 'GPU',
}: UseHandRaiseDetectionProps): void => {
  // Stable refs to avoid stale closures inside the interval callback.
  const onHandRaisedRef = useRef(onHandRaised);
  onHandRaisedRef.current = onHandRaised;

  const recognizerRef = useRef<import('@mediapipe/tasks-vision').GestureRecognizer | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const consecutiveDetectionsRef = useRef(0);
  const hasFiredRef = useRef(false);
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
        console.warn('[useHandRaiseDetection] WebAssembly not supported — skipping detection');
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
          console.warn('[useHandRaiseDetection] Failed to load GestureRecognizer:', err);
          isLoadingRef.current = false;
          return;
        }
        isLoadingRef.current = false;
      }

      if (cancelled || !recognizerRef.current) return;

      // Reset detection state
      consecutiveDetectionsRef.current = 0;
      hasFiredRef.current = false;

      // Start the detection loop
      intervalRef.current = setInterval(() => {
        const recognizer = recognizerRef.current;
        if (!recognizer || !videoElement || videoElement.readyState < 2) {
          return;
        }

        try {
          const result = recognizer.recognizeForVideo(videoElement, performance.now());

          const isRaisedHand = detectRaisedHand(result, gestureConfidence);

          if (isRaisedHand) {
            consecutiveDetectionsRef.current += 1;
            if (
              consecutiveDetectionsRef.current >= requiredConsecutiveDetections &&
              !hasFiredRef.current
            ) {
              hasFiredRef.current = true;
              onHandRaisedRef.current();
            }
          } else {
            consecutiveDetectionsRef.current = 0;
            hasFiredRef.current = false;
          }
        } catch (err) {
          console.warn('[useHandRaiseDetection] Frame processing error:', err);
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

  function cleanup() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    consecutiveDetectionsRef.current = 0;
    hasFiredRef.current = false;

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

/**
 * Returns true if the GestureRecognizer result contains an Open_Palm gesture.
 *
 * We rely solely on the Open_Palm gesture classification (sustained for ≥ 2 s)
 * rather than wrist position. MediaPipe's normalized wrist y-coordinates are
 * unreliable in typical video-call framing (head + shoulders) — the wrist
 * barely moves in normalized space even when the hand is clearly raised.
 * The Open_Palm gesture itself is a strong enough signal: people don't
 * normally hold an open palm facing the camera for 2 seconds.
 */
function detectRaisedHand(
  result: import('@mediapipe/tasks-vision').GestureRecognizerResult,
  gestureConfidence: number
): boolean {
  const { gestures } = result;

  if (!gestures?.length) {
    return false;
  }

  const topGesture = gestures[0]?.[0];
  if (!topGesture) return false;

  return topGesture.categoryName === 'Open_Palm' && topGesture.score >= gestureConfidence;
}

export default useHandRaiseDetection;
