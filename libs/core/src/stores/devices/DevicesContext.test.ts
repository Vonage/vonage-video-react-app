/* eslint-disable @typescript-eslint/no-use-before-define */
import type DeviceStore from './DevicesContext';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import mediaDevicesMock from '@common/test/mocks/mediaDevices';

describe.skip('devices$', () => {
  beforeEach(() => {
    vi.spyOn(mediaDevicesMock, 'addEventListener').mockImplementation(() => {});
    vi.spyOn(mediaDevicesMock, 'enumerateDevices').mockImplementation(() =>
      Promise.resolve(mediaDevices)
    );
  });

  it('should initialize store correctly', async () => {
    const devices$ = await importStore();

    const { result } = renderHook(() => devices$());

    const [state, api] = result.current;

    expect(state.audioOutputDevices).toBeDefined();
    expect(state.devices).toBeDefined();
    expect(api.getConnectedDeviceId).toBeDefined();
    expect(api.updateMediaDevices).toBeDefined();

    expect(mediaDevicesMock.addEventListener).toHaveBeenCalledWith(
      'devicechange',
      expect.any(Function)
    );

    expect(mediaDevicesMock.enumerateDevices).toHaveBeenCalled();
  });
});

const mediaDevices = [
  { deviceId: 'audio-input-1', kind: 'audioinput', label: 'Microphone 1' },
  { deviceId: 'audio-output-1', kind: 'audiooutput', label: 'Speaker 1' },
  { deviceId: 'video-input-1', kind: 'videoinput', label: 'Camera 1' },
] as MediaDeviceInfo[];

async function importStore() {
  return (await import(`./DevicesContext?${crypto.randomUUID()}`)).default as typeof DeviceStore;
}
