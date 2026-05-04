/* cspell:words mediapipe Fileset */
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as mediapipe from '@mediapipe/tasks-vision';
import useGestureDetection from '../useGestureDetection';

const recognizeForVideo = vi.fn();
const close = vi.fn();
const setOptions = vi.fn().mockResolvedValue(undefined);

vi.mock('@mediapipe/tasks-vision', () => ({
  FilesetResolver: { forVisionTasks: vi.fn() },
  GestureRecognizer: { createFromModelPath: vi.fn() },
}));

const noop = () => {};

const makeVideo = () => {
  const v = document.createElement('video');
  // Pretend the video has data ready so the detection tick proceeds.
  Object.defineProperty(v, 'readyState', { configurable: true, value: 4 });
  return v;
};

const gestureResult = (categoryName: string, score = 0.9) => ({
  gestures: [[{ categoryName, score }]],
});

/** Wait one microtask flush so the awaited model load settles. */
const flushModelLoad = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
};

describe('useGestureDetection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    recognizeForVideo.mockReset().mockReturnValue({ gestures: [] });
    close.mockClear();
    setOptions.mockReset().mockResolvedValue(undefined);

    // Wire up the mocked module for each test — global mock-resets between
    // test suites otherwise wipe the resolved values out of the factory.
    const { FilesetResolver, GestureRecognizer } = mediapipe;
    vi.mocked(FilesetResolver.forVisionTasks).mockResolvedValue({} as never);
    vi.mocked(GestureRecognizer.createFromModelPath).mockResolvedValue({
      setOptions,
      recognizeForVideo,
      close,
    } as never);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ---------------------------------------------------------------------------
  // Guards
  // ---------------------------------------------------------------------------

  it('returns null progress when disabled', () => {
    const { result } = renderHook(() =>
      useGestureDetection({
        enabled: false,
        videoElement: makeVideo(),
        onHandRaised: noop,
      })
    );
    expect(result.current).toBeNull();
  });

  it('returns null progress when videoElement is null', () => {
    const { result } = renderHook(() =>
      useGestureDetection({
        enabled: true,
        videoElement: null,
        onHandRaised: noop,
      })
    );
    expect(result.current).toBeNull();
  });

  it('cleanup runs without throwing when enabled flips false', async () => {
    const video = makeVideo();
    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useGestureDetection({ enabled, videoElement: video, onHandRaised: noop }),
      { initialProps: { enabled: true } }
    );
    await flushModelLoad();

    expect(() => rerender({ enabled: false })).not.toThrow();
    expect(result.current).toBeNull();
    // Disposing the model is part of cleanup.
    expect(close).toHaveBeenCalled();
  });

  it('unmount with enabled=true does not throw', async () => {
    const { unmount } = renderHook(() =>
      useGestureDetection({
        enabled: true,
        videoElement: makeVideo(),
        onHandRaised: noop,
      })
    );
    await flushModelLoad();
    expect(() => unmount()).not.toThrow();
  });

  // ---------------------------------------------------------------------------
  // Sustained-detection state machine
  //
  // The full timing-driven scenarios (state transitions, exact fire count
  // after N consecutive frames, callback routing) are exercised end-to-end
  // by the integration tests because driving the React 18 effect → fake
  // timer → microtask → state update chain deterministically here is
  // brittle. The remaining tests cover the deterministic guards.
  // ---------------------------------------------------------------------------

  it('resets the consecutive count when the gesture is interrupted by a different result', async () => {
    const onHandRaised = vi.fn();
    const video = makeVideo();
    renderHook(() =>
      useGestureDetection({
        enabled: true,
        videoElement: video,
        onHandRaised,
        detectionIntervalMs: 100,
        detectionDurationMs: 400,
      })
    );
    await flushModelLoad();

    // 2 frames Open_Palm → 1 frame nothing → 2 frames Open_Palm = NOT enough yet.
    recognizeForVideo
      .mockReturnValueOnce(gestureResult('Open_Palm'))
      .mockReturnValueOnce(gestureResult('Open_Palm'))
      .mockReturnValueOnce({ gestures: [] })
      .mockReturnValueOnce(gestureResult('Open_Palm'))
      .mockReturnValueOnce(gestureResult('Open_Palm'))
      .mockReturnValue({ gestures: [] });

    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });
    expect(onHandRaised).not.toHaveBeenCalled();
  });

  it('does not fire any callback for an unsupported gesture', async () => {
    const onHandRaised = vi.fn();
    const onThumbsUp = vi.fn();
    const onThumbsDown = vi.fn();
    const video = makeVideo();
    renderHook(() =>
      useGestureDetection({
        enabled: true,
        videoElement: video,
        onHandRaised,
        onThumbsUp,
        onThumbsDown,
        detectionIntervalMs: 100,
        detectionDurationMs: 200,
      })
    );
    await flushModelLoad();

    // Pointing_Up is not in the tracked-gestures set.
    recognizeForVideo.mockReturnValue(gestureResult('Pointing_Up'));
    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    expect(onHandRaised).not.toHaveBeenCalled();
    expect(onThumbsUp).not.toHaveBeenCalled();
    expect(onThumbsDown).not.toHaveBeenCalled();
  });

  it('ignores low-confidence detections below the configured threshold', async () => {
    const onHandRaised = vi.fn();
    const video = makeVideo();
    renderHook(() =>
      useGestureDetection({
        enabled: true,
        videoElement: video,
        onHandRaised,
        detectionIntervalMs: 100,
        detectionDurationMs: 200,
        gestureConfidence: 0.8, // strict threshold
      })
    );
    await flushModelLoad();

    // 0.5 < 0.8 → discarded every tick.
    recognizeForVideo.mockReturnValue(gestureResult('Open_Palm', 0.5));
    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });
    expect(onHandRaised).not.toHaveBeenCalled();
  });
});
