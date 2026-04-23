/* cspell:words mediapipe Fileset */
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useGestureDetection from '../useGestureDetection';

vi.mock('@mediapipe/tasks-vision', () => ({
  FilesetResolver: {
    forVisionTasks: vi.fn().mockResolvedValue({}),
  },
  GestureRecognizer: {
    createFromModelPath: vi.fn().mockResolvedValue({
      setOptions: vi.fn().mockResolvedValue(undefined),
      recognizeForVideo: vi.fn().mockReturnValue({ gestures: [] }),
      close: vi.fn(),
    }),
  },
}));

const noop = () => {};

describe('useGestureDetection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('returns null progress when disabled', () => {
    const fakeVideo = document.createElement('video');
    const { result } = renderHook(() =>
      useGestureDetection({
        enabled: false,
        videoElement: fakeVideo,
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

  it('cleanup runs when enabled flips false (no errors)', () => {
    const fakeVideo = document.createElement('video');
    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useGestureDetection({
          enabled,
          videoElement: fakeVideo,
          onHandRaised: noop,
        }),
      { initialProps: { enabled: true } }
    );

    expect(() => {
      rerender({ enabled: false });
    }).not.toThrow();

    expect(result.current).toBeNull();
  });

  it('unmount with enabled true does not throw', () => {
    const fakeVideo = document.createElement('video');
    const { unmount } = renderHook(() =>
      useGestureDetection({
        enabled: true,
        videoElement: fakeVideo,
        onHandRaised: noop,
      })
    );

    expect(() => unmount()).not.toThrow();
  });
});
