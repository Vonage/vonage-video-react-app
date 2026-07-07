import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Publisher } from '@vonage/client-sdk-video';

const { subscribeMock, getMetadataMock, mediaDevicesMapStateMock } = vi.hoisted(() => ({
  subscribeMock: vi.fn((..._args: unknown[]) => () => {}),
  getMetadataMock: vi.fn(() => ({ isStoreReady: { status: 'resolved' } })),
  mediaDevicesMapStateMock: vi.fn(() => ({ audioinput: {}, videoinput: {} })),
}));

vi.mock('@core/stores/mediaDevices', () => ({
  default: {
    subscribe: (...args: unknown[]) => subscribeMock(...args),
    getMetadata: () => getMetadataMock(),
    mediaDevicesMap$: { getState: () => mediaDevicesMapStateMock() },
  },
}));

import useSyncPublisherDevices from './useSyncPublisherDevices';

describe('useSyncPublisherDevices', () => {
  beforeEach(() => {
    subscribeMock.mockClear().mockReturnValue(() => {});
    getMetadataMock.mockReturnValue({ isStoreReady: { status: 'resolved' } });
    // No audio inputs left — the active microphone has disappeared.
    mediaDevicesMapStateMock.mockReturnValue({ audioinput: {}, videoinput: {} });
  });

  it('stops publishing audio (not only the UI state) when the last microphone disappears', async () => {
    const publisher = {
      getAudioSource: () => ({ id: 'old-track-id' }),
      setAudioSource: vi.fn().mockResolvedValue(undefined),
      publishAudio: vi.fn(),
    } as unknown as Publisher;

    const publisherRef = { current: publisher };
    const setIsAudioEnabled = vi.fn();

    // Only the audio subscription is registered (no setIsVideoEnabled passed).
    renderHook(() => useSyncPublisherDevices(publisherRef, { setIsAudioEnabled }));

    const audioListener = subscribeMock.mock.calls[0]?.[1] as (
      input: string | undefined
    ) => Promise<void>;

    await audioListener('new-device-id');

    expect(publisher.publishAudio).toHaveBeenCalledWith(false);
    expect(setIsAudioEnabled).toHaveBeenCalledWith(false);
  });

  it('stops publishing video (not only the UI state) when the last camera disappears', async () => {
    const publisher = {
      getVideoSource: () => ({ deviceId: 'old-track-id' }),
      setVideoSource: vi.fn().mockResolvedValue(undefined),
      publishVideo: vi.fn(),
    } as unknown as Publisher;

    const publisherRef = { current: publisher };
    const setIsVideoEnabled = vi.fn();

    // Only the video subscription is registered (no setIsAudioEnabled passed).
    renderHook(() => useSyncPublisherDevices(publisherRef, { setIsVideoEnabled }));

    const videoListener = subscribeMock.mock.calls[0]?.[1] as (
      input: string | undefined
    ) => Promise<void>;

    await videoListener('new-device-id');

    expect(publisher.publishVideo).toHaveBeenCalledWith(false);
    expect(setIsVideoEnabled).toHaveBeenCalledWith(false);
  });
});
