import { beforeEach, describe, it, expect, vi, afterAll, MockInstance } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { AudioOutputDevice } from '@vonage/client-sdk-video';
import * as OT from '@vonage/client-sdk-video';
import useAudioOutput from './useAudioOutput';
import { nativeDevices } from '../../../utils/mockData/device';

vi.mock('@vonage/client-sdk-video');

describe('useAudioOutput', () => {
  const nativeMediaDevices = global.navigator.mediaDevices;
  let mockGetActiveAudioOutputDevice: MockInstance<[], Promise<AudioOutputDevice>>;
  let mockSetAudioOutputDevice: MockInstance<[deviceId: string], Promise<void>>;

  beforeEach(() => {
    vi.resetAllMocks();
    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: {
        enumerateDevices: vi.fn(
          () =>
            new Promise<MediaDeviceInfo[]>((res) => {
              res(nativeDevices as MediaDeviceInfo[]);
            })
        ),
        addEventListener: vi.fn(() => []),
        removeEventListener: vi.fn(() => []),
      },
    });
    mockGetActiveAudioOutputDevice = vi.spyOn(OT, 'getActiveAudioOutputDevice').mockImplementation(
      () =>
        new Promise<AudioOutputDevice>((res) => {
          res({
            deviceId: 'some-device-id',
            label: 'some-device-label',
          });
        })
    );
    mockSetAudioOutputDevice = vi.spyOn(OT, 'setAudioOutputDevice').mockImplementation(
      () =>
        new Promise<void>((res) => {
          res();
        })
    );
  });

  afterAll(() => {
    vi.restoreAllMocks();
    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: nativeMediaDevices,
    });
  });

  it('should provide initial state', () => {
    const { result } = renderHook(() => useAudioOutput());

    expect(result.current.currentAudioOutputDevice).toBeUndefined();
    expect(result.current.setAudioOutputDevice).toBeDefined();
  });

  it('should call getActiveAudioOutputDevice when initialized', async () => {
    const { result } = renderHook(() => useAudioOutput());

    await waitFor(() => expect(result.current.currentAudioOutputDevice).toBe('some-device-id'));

    expect(mockGetActiveAudioOutputDevice).toHaveBeenCalledOnce();
  });

  it('should update currentAudioOutputDevice when setAudioOutputDevice is called', async () => {
    const newAudioOutput = 'new-audio-output-device';
    const { result, rerender } = renderHook(() => useAudioOutput());

    await act(async () => {
      await result.current.setAudioOutputDevice(newAudioOutput);
    });

    rerender();

    expect(result.current.currentAudioOutputDevice).toBe(newAudioOutput);
  });

  it('should call setAudioOutputDevice when currentAudioOutputDevice is called', async () => {
    const newAudioOutput = 'new-audio-output-device';
    const { result } = renderHook(() => useAudioOutput());

    await act(async () => {
      await result.current.setAudioOutputDevice(newAudioOutput);
    });

    expect(mockSetAudioOutputDevice).toHaveBeenCalledOnce();
  });
});
