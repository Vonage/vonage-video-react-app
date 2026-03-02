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
});
