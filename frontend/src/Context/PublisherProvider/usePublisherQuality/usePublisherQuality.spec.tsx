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

  it('removes listeners from the previous publisher when the publisher is re-created', () => {
    const oldPublisher = new EventEmitter();
    const newPublisher = new EventEmitter();

    const { rerender } = renderHook(
      (publisher: EventEmitter) => usePublisherQuality(publisher as unknown as Publisher),
      { initialProps: oldPublisher }
    );

    // Publisher re-created (reconnect/recovery, device change).
    rerender(newPublisher);

    // The old publisher must no longer be observed — otherwise its listeners leak.
    expect(oldPublisher.listenerCount('videoDisabled')).toBe(0);

    // A stale event from the old publisher must not inflate the shared fallback counter.
    const audioFallbacksBefore = mockUserContext.user.issues.audioFallbacks;
    act(() => {
      oldPublisher.emit('videoDisabled');
    });
    expect(mockUserContext.user.issues.audioFallbacks).toBe(audioFallbacksBefore);
  });
});
