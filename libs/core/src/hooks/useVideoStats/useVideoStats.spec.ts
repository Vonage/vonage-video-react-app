import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Publisher } from '@vonage/client-sdk-video';
import useVideoStats, { formatResolution, formatFrameRate } from './index';

describe('useVideoStats', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createMockPublisher = (
    width: number | undefined,
    height: number | undefined,
    frameRate: number | undefined
  ) =>
    ({
      videoWidth: vi.fn().mockReturnValue(width),
      videoHeight: vi.fn().mockReturnValue(height),
      getVideoSource: vi.fn().mockReturnValue({
        track: {
          getSettings: vi.fn().mockReturnValue({ frameRate }),
        },
      }),
    }) as unknown as Publisher;

  it('should return null values when publisher is null', () => {
    const { result } = renderHook(() => useVideoStats(null));

    expect(result.current).toEqual({
      width: null,
      height: null,
      frameRate: null,
    });
  });

  it('should return video stats from publisher', () => {
    const publisher = createMockPublisher(1280, 720, 30);
    const { result } = renderHook(() => useVideoStats(publisher));

    expect(result.current).toEqual({
      width: 1280,
      height: 720,
      frameRate: 30,
    });
  });

  it('should update stats on interval', () => {
    const publisher = createMockPublisher(1280, 720, 30);
    const { result } = renderHook(() => useVideoStats(publisher));

    expect(result.current.height).toBe(720);

    (publisher.videoWidth as ReturnType<typeof vi.fn>).mockReturnValue(1920);
    (publisher.videoHeight as ReturnType<typeof vi.fn>).mockReturnValue(1080);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current).toEqual({
      width: 1920,
      height: 1080,
      frameRate: 30,
    });
  });

  it('should handle publisher with no video source track', () => {
    const publisher = {
      videoWidth: vi.fn().mockReturnValue(640),
      videoHeight: vi.fn().mockReturnValue(480),
      getVideoSource: vi.fn().mockReturnValue({ track: null }),
    } as unknown as Publisher;

    const { result } = renderHook(() => useVideoStats(publisher));

    expect(result.current).toEqual({
      width: 640,
      height: 480,
      frameRate: null,
    });
  });

  it('should handle getVideoSource throwing an error', () => {
    const publisher = {
      videoWidth: vi.fn().mockReturnValue(640),
      videoHeight: vi.fn().mockReturnValue(480),
      getVideoSource: vi.fn().mockImplementation(() => {
        throw new Error('Not initialized');
      }),
    } as unknown as Publisher;

    const { result } = renderHook(() => useVideoStats(publisher));

    expect(result.current).toEqual({
      width: 640,
      height: 480,
      frameRate: null,
    });
  });

  it('should reset stats when publisher becomes null', () => {
    const publisher = createMockPublisher(1280, 720, 30);
    const { result, rerender } = renderHook(({ pub }) => useVideoStats(pub), {
      initialProps: { pub: publisher as Publisher | null },
    });

    expect(result.current.height).toBe(720);

    rerender({ pub: null });

    expect(result.current).toEqual({
      width: null,
      height: null,
      frameRate: null,
    });
  });

  it('should update stats when publisher instance changes', () => {
    const firstPublisher = createMockPublisher(640, 480, 30);
    const secondPublisher = createMockPublisher(1280, 720, 60);

    const { result, rerender } = renderHook(({ pub }) => useVideoStats(pub), {
      initialProps: { pub: firstPublisher as Publisher | null },
    });

    expect(result.current).toEqual({
      width: 640,
      height: 480,
      frameRate: 30,
    });

    rerender({ pub: secondPublisher as Publisher | null });

    expect(result.current).toEqual({
      width: 1280,
      height: 720,
      frameRate: 60,
    });
  });

  it('should clean up interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    const publisher = createMockPublisher(1280, 720, 30);
    const { unmount } = renderHook(() => useVideoStats(publisher));

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});

describe('formatResolution', () => {
  it('should format height to resolution label', () => {
    expect(formatResolution(1080)).toBe('1080p');
    expect(formatResolution(720)).toBe('720p');
    expect(formatResolution(480)).toBe('480p');
  });

  it('should return null for null height', () => {
    expect(formatResolution(null)).toBeNull();
  });
});

describe('formatFrameRate', () => {
  it('should format fps to display string', () => {
    expect(formatFrameRate(30)).toBe('30fps');
    expect(formatFrameRate(29.97)).toBe('30fps');
    expect(formatFrameRate(60)).toBe('60fps');
  });

  it('should return null for null fps', () => {
    expect(formatFrameRate(null)).toBeNull();
  });
});
