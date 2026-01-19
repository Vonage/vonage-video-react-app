import { beforeEach, describe, it, expect, vi, MockInstance } from 'vitest';
import { act, waitFor, renderHook as renderHookBase } from '@testing-library/react';
import { AudioOutputDevice } from '@vonage/client-sdk-video';
import * as OT from '@vonage/client-sdk-video';
import { makeAudioOutputProviderWrapper, AudioOutputProviderWrapperOptions } from '@test/providers';
import { nativeDevices } from '../../../utils/mockData/device';

vi.mock('@vonage/client-sdk-video');

describe('useAudioOutput', () => {
  vi.clearAllMocks();

  let mockGetActiveAudioOutputDevice: MockInstance<[], Promise<AudioOutputDevice>>;
  let mockSetAudioOutputDevice: MockInstance<[deviceId: string], Promise<void>>;

  beforeEach(() => {
    const { mediaDevices } = globalThis.navigator;

    vi.spyOn(mediaDevices, 'addEventListener').mockImplementation(() => {});
    vi.spyOn(mediaDevices, 'removeEventListener').mockImplementation(() => {});
    vi.spyOn(mediaDevices, 'enumerateDevices').mockResolvedValue(nativeDevices);

    mockGetActiveAudioOutputDevice = vi
      .spyOn(OT, 'getActiveAudioOutputDevice')
      .mockImplementation(() =>
        Promise.resolve({
          deviceId: 'some-device-id',
          label: 'some-device-label',
        })
      );
    mockSetAudioOutputDevice = vi
      .spyOn(OT, 'setAudioOutputDevice')
      .mockImplementation(() => Promise.resolve());
  });

  it('should provide initial state', async () => {
    const { audioOutputContext } = render();

    await waitFor(() => {
      expect(audioOutputContext.current.currentAudioOutputDevice).toBeDefined();
    });

    expect(audioOutputContext.current.setAudioOutputDevice).toBeDefined();
  });

  it('should call getActiveAudioOutputDevice when initialized', async () => {
    const { audioOutputContext } = render();

    await waitFor(() =>
      expect(audioOutputContext.current.currentAudioOutputDevice).toBe('some-device-id')
    );

    expect(mockGetActiveAudioOutputDevice).toHaveBeenCalledOnce();
  });

  it('should update currentAudioOutputDevice when setAudioOutputDevice is called', async () => {
    const newAudioOutput = 'new-audio-output-device';
    const { audioOutputContext, rerender } = render();

    await act(async () => {
      await audioOutputContext.current.setAudioOutputDevice(newAudioOutput);
    });

    rerender();

    expect(audioOutputContext.current.currentAudioOutputDevice).toBe(newAudioOutput);
  });

  it('should call setAudioOutputDevice when currentAudioOutputDevice is called', async () => {
    const newAudioOutput = 'new-audio-output-device';
    const { audioOutputContext } = render();

    await act(async () => {
      await audioOutputContext.current.setAudioOutputDevice(newAudioOutput);
    });

    expect(mockSetAudioOutputDevice).toHaveBeenCalledOnce();
  });

  it('should register devicechange event listener on mount', async () => {
    render();

    await waitFor(() => {
      expect(globalThis.navigator.mediaDevices.addEventListener).toHaveBeenCalledWith(
        'devicechange',
        expect.any(Function)
      );
    });
  });

  it('should remove devicechange event listener on unmount', async () => {
    const { unmount } = render();

    await waitFor(() => {
      expect(globalThis.navigator.mediaDevices.addEventListener).toHaveBeenCalled();
    });

    unmount();

    expect(globalThis.navigator.mediaDevices.removeEventListener).toHaveBeenCalledWith(
      'devicechange',
      expect.any(Function)
    );
  });
});

function render(options?: AudioOutputProviderWrapperOptions) {
  const { AudioOutputProviderWrapper, audioOutputContext } =
    makeAudioOutputProviderWrapper(options);

  return {
    ...renderHookBase(() => {}, { wrapper: AudioOutputProviderWrapper }),
    audioOutputContext,
  };
}
