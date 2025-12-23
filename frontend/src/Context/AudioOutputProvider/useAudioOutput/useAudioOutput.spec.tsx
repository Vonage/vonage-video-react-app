import { beforeEach, describe, it, expect, vi, MockInstance } from 'vitest';
import { act, waitFor } from '@testing-library/react';
import { AudioOutputDevice } from '@vonage/client-sdk-video';
import * as OT from '@vonage/client-sdk-video';
import { setupNavigatorMocks } from '@test/setup/setupNavigatorMocks';
import { renderHookWithAudioOutput as render } from '@test/helpers/renderWithProviders';
import useAudioOutput from './useAudioOutput';
import { nativeDevices } from '../../../utils/mockData/device';

vi.mock('@vonage/client-sdk-video');

describe('useAudioOutput', () => {
  let mockGetActiveAudioOutputDevice: MockInstance<[], Promise<AudioOutputDevice>>;
  let mockSetAudioOutputDevice: MockInstance<[deviceId: string], Promise<void>>;

  beforeEach(() => {
    vi.resetAllMocks();
    setupNavigatorMocks({
      mediaDevices: {
        enumerateDevices: vi.fn(() => Promise.resolve(nativeDevices as MediaDeviceInfo[])),
      },
    });
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
    const { result } = render(useAudioOutput);

    await waitFor(() => {
      expect(result.current.currentAudioOutputDevice).toBeDefined();
    });

    expect(result.current.setAudioOutputDevice).toBeDefined();
  });

  it('should call getActiveAudioOutputDevice when initialized', async () => {
    const { result } = render(useAudioOutput);

    await waitFor(() => expect(result.current.currentAudioOutputDevice).toBe('some-device-id'));

    expect(mockGetActiveAudioOutputDevice).toHaveBeenCalled();
  });

  it('should update currentAudioOutputDevice when setAudioOutputDevice is called', async () => {
    const newAudioOutput = 'new-audio-output-device';
    const { result, rerender } = render(useAudioOutput);

    await act(async () => {
      await result.current.setAudioOutputDevice(newAudioOutput);
    });

    rerender();

    expect(result.current.currentAudioOutputDevice).toBe(newAudioOutput);
  });

  it('should call setAudioOutputDevice when currentAudioOutputDevice is called', async () => {
    const newAudioOutput = 'new-audio-output-device';
    const { result } = render(useAudioOutput);

    await act(async () => {
      await result.current.setAudioOutputDevice(newAudioOutput);
    });

    expect(mockSetAudioOutputDevice).toHaveBeenCalledOnce();
  });
});
