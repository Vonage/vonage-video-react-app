/* cspell:words mediapipe MEDIAPIPE XNNPACK normalised fileset */
import { useEffect, useRef, useState } from 'react';

const DEFAULT_DETECTION_INTERVAL_MS = 250;
const DEFAULT_DETECTION_DURATION_MS = 2000;
const DEFAULT_GESTURE_CONFIDENCE = 0.45;

// Self-hosted from frontend/public/mediapipe — see scripts/prepareMediaPipeAssets.ts.
// Avoids the runtime supply-chain risk and offline failure mode of an external
// CDN. Files are pre-compressed to .br at build time and served with the
// correct Content-Encoding by express-static-gzip.
const MEDIAPIPE_WASM_CDN = '/mediapipe/wasm';
const GESTURE_RECOGNIZER_MODEL = '/mediapipe/gesture_recognizer.task';

export type GestureName = 'Open_Palm' | 'Thumb_Up' | 'Thumb_Down';

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
};

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
}: UseGestureDetectionProps): GestureProgress => {
  // Refs let the interval callback see latest values without restarting the
  // model load loop on every render.
  const callbacksRef = useRef({ onHandRaised, onThumbsUp, onThumbsDown });
  callbacksRef.current = { onHandRaised, onThumbsUp, onThumbsDown };

  const optionsRef = useRef({
    delegate,
    detectionIntervalMs,
    detectionDurationMs,
    gestureConfidence,
  });
  optionsRef.current = {
    delegate,
    detectionIntervalMs,
    detectionDurationMs,
    gestureConfidence,
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

  const [gestureProgress, setGestureProgress] = useState<GestureProgress>(null);

  const requiredConsecutiveDetections = Math.max(
    1,
    Math.ceil(detectionDurationMs / detectionIntervalMs)
  );

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

  const runDetectionTick = (videoEl: HTMLVideoElement) => {
    const recognizer = recognizerRef.current;
    if (!recognizer || videoEl.readyState < 2) return;

    try {
      const result = recognizer.recognizeForVideo(videoEl, performance.now());
      const detected = detectGesture(result, optionsRef.current.gestureConfidence);
      const callbacks = callbacksRef.current;
      const currentDurationMs = optionsRef.current.detectionDurationMs;

      const gestureCallbacks: Record<GestureName, (() => void) | undefined> = {
        Open_Palm: callbacks.onHandRaised,
        Thumb_Up: callbacks.onThumbsUp,
        Thumb_Down: callbacks.onThumbsDown,
      };

      const anyActive = (Object.keys(gestureStateRef.current) as GestureName[]).reduce(
        (active, gesture) =>
          advanceGestureState(gesture, detected, gestureCallbacks, currentDurationMs) || active,
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

    if (recognizerRef.current) {
      recognizerRef.current.close();
      recognizerRef.current = null;
    }
    isLoadingRef.current = false;
  }

  return gestureProgress;
};

const TRACKED_GESTURES: ReadonlySet<string> = new Set<GestureName>([
  'Open_Palm',
  'Thumb_Up',
  'Thumb_Down',
]);

/**
 * Returns the detected gesture if the top classification is one we track and
 * meets the confidence threshold. We rely on gesture classification rather
 * than wrist position because MediaPipe's normalised wrist y-coordinates are
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
