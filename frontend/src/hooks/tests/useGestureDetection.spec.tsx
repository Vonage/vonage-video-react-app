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

  it.each([
    ['enabled: false, video provided', { enabled: false, videoElement: makeVideo() }],
    ['enabled: true, videoElement: null', { enabled: true, videoElement: null }],
  ])('returns null progress when %s', (_label, props) => {
    const { result } = renderHook(() =>
      useGestureDetection({
        ...props,
        onHandRaised: noop,
      })
    );
    expect(result.current).toBeNull();
  });

  it('tears down cleanly on disable and on unmount (model disposed, no throws)', async () => {
    const video = makeVideo();

    // Path 1: enabled flips false.
    const {
      result,
      rerender,
      unmount: unmount1,
    } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useGestureDetection({ enabled, videoElement: video, onHandRaised: noop }),
      { initialProps: { enabled: true } }
    );
    await flushModelLoad();
    expect(() => rerender({ enabled: false })).not.toThrow();
    expect(result.current).toBeNull();
    expect(close).toHaveBeenCalled();
    unmount1();

    // Path 2: unmount while enabled is still true.
    close.mockClear();
    const { unmount: unmount2 } = renderHook(() =>
      useGestureDetection({ enabled: true, videoElement: video, onHandRaised: noop })
    );
    await flushModelLoad();
    expect(() => unmount2()).not.toThrow();
    expect(close).toHaveBeenCalled();
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

  it('ignores untracked gestures and below-threshold confidence — no callback fires', async () => {
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
        gestureConfidence: 0.8, // strict threshold
      })
    );
    await flushModelLoad();

    // Mix of two reasons a tick should be discarded: an untracked gesture
    // (Pointing_Up) and a tracked gesture below the confidence threshold
    // (Open_Palm at 0.5 < 0.8). Either way nothing should fire.
    recognizeForVideo
      .mockReturnValueOnce(gestureResult('Pointing_Up'))
      .mockReturnValueOnce(gestureResult('Open_Palm', 0.5))
      .mockReturnValueOnce(gestureResult('Pointing_Up'))
      .mockReturnValueOnce(gestureResult('Open_Palm', 0.5))
      .mockReturnValue(gestureResult('Pointing_Up'));
    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    expect(onHandRaised).not.toHaveBeenCalled();
    expect(onThumbsUp).not.toHaveBeenCalled();
    expect(onThumbsDown).not.toHaveBeenCalled();
  });
});
