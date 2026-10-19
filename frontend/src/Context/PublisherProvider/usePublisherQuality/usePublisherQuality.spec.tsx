import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Publisher } from '@vonage/client-sdk-video';
import EventEmitter from 'events';
import useUserContext from '@hooks/useUserContext';
import type { UserContextType } from '../../user';
import usePublisherQuality from './usePublisherQuality';

vi.mock('@hooks/useUserContext.tsx');

const mockUserContext: UserContextType = {
  user: {
    defaultSettings: {
      publishAudio: false,
      publishVideo: false,
      name: '',
      noiseSuppression: true,
      publishCaptions: false,
    },
    issues: {
      reconnections: 0,
      audioFallbacks: 0,
    },
  },
  setUser: vi.fn(),
};

describe('usePublisherQuality', () => {
  beforeEach(() => {
    vi.mocked(useUserContext).mockImplementation(() => mockUserContext);
  });

  it('should set quality to good on videoEnabled event', async () => {
    const mockPublisher = new EventEmitter();
    const { result } = renderHook(() => usePublisherQuality(mockPublisher as unknown as Publisher));
    void act(() => mockPublisher.emit('videoEnabled'));
    await waitFor(() => expect(result.current).toBe('good'));
  });

  it('should set quality to good on videoDisableWarningLifted event', async () => {
    const mockPublisher = new EventEmitter();
    const { result } = renderHook(() => usePublisherQuality(mockPublisher as unknown as Publisher));
    void act(() => mockPublisher.emit('videoDisableWarningLifted'));
    await waitFor(() => expect(result.current).toBe('good'));
  });

  it('should set quality to good on videoDisabled event', async () => {
    const mockPublisher = new EventEmitter();
    const { result } = renderHook(() => usePublisherQuality(mockPublisher as unknown as Publisher));
    void act(() => mockPublisher.emit('videoDisabled'));
    await waitFor(() => expect(result.current).toBe('bad'));
    expect(useUserContext().user.issues.audioFallbacks).toBe(1);
  });

  it('should set quality to good on videoDisableWarning event', async () => {
    const mockPublisher = new EventEmitter();
    const { result } = renderHook(() => usePublisherQuality(mockPublisher as unknown as Publisher));
    void act(() => mockPublisher.emit('videoDisableWarning'));
    await waitFor(() => expect(result.current).toBe('poor'));
  });

  describe('publisher transitions', () => {
    it('resets quality and ignores stale events when the publisher is swapped', async () => {
      const publisherA = new EventEmitter();
      const publisherB = new EventEmitter();
      const { result, rerender } = renderHook(
        ({ publisher }) => usePublisherQuality(publisher as unknown as Publisher),
        { initialProps: { publisher: publisherA } }
      );

      void act(() => publisherA.emit('videoDisableWarning'));
      await waitFor(() => expect(result.current).toBe('poor'));

      rerender({ publisher: publisherB });
      await waitFor(() => expect(result.current).toBe('good'));

      void act(() => publisherA.emit('videoDisableWarning'));
      expect(result.current).toBe('good');

      void act(() => publisherB.emit('videoDisabled'));
      await waitFor(() => expect(result.current).toBe('bad'));
    });

    it('resets quality when the publisher becomes null', async () => {
      const mockPublisher = new EventEmitter();
      const { result, rerender } = renderHook(
        ({ publisher }) => usePublisherQuality(publisher as unknown as Publisher | null),
        { initialProps: { publisher: mockPublisher as EventEmitter | null } }
      );

      void act(() => mockPublisher.emit('videoDisableWarning'));
      await waitFor(() => expect(result.current).toBe('poor'));

      rerender({ publisher: null });
      await waitFor(() => expect(result.current).toBe('good'));
    });

    it('removes all listeners from the publisher on unmount', () => {
      const mockPublisher = new EventEmitter();
      const { unmount } = renderHook(() =>
        usePublisherQuality(mockPublisher as unknown as Publisher)
      );

      expect(mockPublisher.listenerCount('videoDisabled')).toBeGreaterThan(0);

      unmount();

      expect(mockPublisher.listenerCount('videoDisabled')).toBe(0);
      expect(mockPublisher.listenerCount('videoEnabled')).toBe(0);
      expect(mockPublisher.listenerCount('videoDisableWarning')).toBe(0);
      expect(mockPublisher.listenerCount('videoDisableWarningLifted')).toBe(0);
    });
  });
});
