import { beforeEach, describe, it, expect, vi, MockInstance } from 'vitest';
import { act, waitFor } from '@testing-library/react';
import { AudioOutputDevice } from '@vonage/client-sdk-video';
import * as OT from '@vonage/client-sdk-video';
import { renderHookWithAudioOutput } from '@test/helpers/renderWithProviders';
import { nativeDevices } from '../../../utils/mockData/device';

vi.mock('@vonage/client-sdk-video');

const mediaDevicesMock: Partial<MediaDevices> = {
  ondevicechange: null,
  enumerateDevices() {
    throw new Error('enumerateDevices was called but not mocked.');
  },
  addEventListener() {
    throw new Error('addEventListener was called but not mocked.');
  },
  removeEventListener() {
    throw new Error('removeEventListener was called but not mocked.');
  },
};

describe('useAudioOutput', () => {
  let mockGetActiveAudioOutputDevice: MockInstance<[], Promise<AudioOutputDevice>>;
  let mockSetAudioOutputDevice: MockInstance<[deviceId: string], Promise<void>>;

  beforeEach(() => {
    Object.defineProperty(globalThis.navigator, 'mediaDevices', {
      writable: true,
      value: mediaDevicesMock,
    });

    vi.spyOn(mediaDevicesMock, 'addEventListener').mockImplementation(() => {});
    vi.spyOn(mediaDevicesMock, 'removeEventListener').mockImplementation(() => {});
    vi.spyOn(mediaDevicesMock, 'enumerateDevices').mockResolvedValue(
      nativeDevices as MediaDeviceInfo[]
    );

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
    const { audioOutputContext } = renderHookWithAudioOutput(() => null);

    await waitFor(() => {
      expect(audioOutputContext.current.currentAudioOutputDevice).toBeDefined();
    });

    expect(audioOutputContext.current.setAudioOutputDevice).toBeDefined();
  });

  it('should call getActiveAudioOutputDevice when initialized', async () => {
    const { audioOutputContext } = renderHookWithAudioOutput(() => null);

    await waitFor(() =>
      expect(audioOutputContext.current.currentAudioOutputDevice).toBe('some-device-id')
    );

    expect(mockGetActiveAudioOutputDevice).toHaveBeenCalledOnce();
  });

  it('should update currentAudioOutputDevice when setAudioOutputDevice is called', async () => {
    const newAudioOutput = 'new-audio-output-device';
    const { audioOutputContext, rerender } = renderHookWithAudioOutput(() => null);

    await act(async () => {
      await audioOutputContext.current.setAudioOutputDevice(newAudioOutput);
    });

    rerender();

    expect(audioOutputContext.current.currentAudioOutputDevice).toBe(newAudioOutput);
  });

  it('should call setAudioOutputDevice when currentAudioOutputDevice is called', async () => {
    const newAudioOutput = 'new-audio-output-device';
    const { audioOutputContext } = renderHookWithAudioOutput(() => null);

    await act(async () => {
      await audioOutputContext.current.setAudioOutputDevice(newAudioOutput);
    });

    expect(mockSetAudioOutputDevice).toHaveBeenCalledOnce();
  });

  it('should register devicechange event listener on mount', async () => {
    renderHookWithAudioOutput(() => null);

    await waitFor(() => {
      expect(mediaDevicesMock.addEventListener).toHaveBeenCalledWith(
        'devicechange',
        expect.any(Function)
      );
    });
  });

  it('should remove devicechange event listener on unmount', async () => {
    const { unmount } = renderHookWithAudioOutput(() => null);

    await waitFor(() => {
      expect(mediaDevicesMock.addEventListener).toHaveBeenCalled();
    });

    unmount();

    expect(mediaDevicesMock.removeEventListener).toHaveBeenCalledWith(
      'devicechange',
      expect.any(Function)
    );
  });
});
