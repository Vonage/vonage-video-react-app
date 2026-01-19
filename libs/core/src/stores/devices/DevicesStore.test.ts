/* eslint-disable @typescript-eslint/no-use-before-define */
import { vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type DeviceStore from './DevicesStore';
import type * as ClientSdkVideo from '@vonage/client-sdk-video';
import wait from '@common/execution/wait';
import devices$, { initialValue, metadata } from './';

describe('devices$', () => {
  beforeEach(() => {
    vi.spyOn(clientSdkVideo, 'getDevices').mockImplementation(async (callback) => {
      await wait(0);
      callback(undefined, devices);
    });

    vi.spyOn(clientSdkVideo, 'getAudioOutputDevices').mockImplementation(() =>
      Promise.resolve(
        mediaDevicesInfo.filter(
          (device) => device.kind === 'audiooutput'
        ) as ClientSdkVideo.AudioOutputDevice[]
      )
    );

    vi.spyOn(globalThis.navigator.mediaDevices, 'addEventListener').mockImplementation(() => {});

    vi.spyOn(globalThis.navigator.mediaDevices, 'enumerateDevices').mockImplementation(() =>
      Promise.resolve(mediaDevicesInfo)
    );

    devices$.reset(initialValue, { ...metadata });
    vi.clearAllMocks();
  });

  it('should initialize store correctly', async () => {
    expect.assertions(11);

    const { mediaDevices } = globalThis.navigator;

    // Import fresh store instance
    const devices$ = await importStore();

    const { result } = renderHook(() => devices$());

    let [state, api] = result.current;

    // Verify initial state and API structure
    expect(state.audioOutputDevices).toBeDefined();
    expect(state.devices).toBeDefined();

    // api actions
    expect(api.setAudioOutputDevice).toBeDefined();
    expect(api.syncDevicesList).toBeDefined();
    expect(api.syncAudioOutputDevicesList).toBeDefined();
    expect(api.syncMediaDevicesList).toBeDefined();

    // Verify devicechange event listener was registered only once
    expect(mediaDevices.addEventListener).toHaveBeenCalledTimes(1);

    expect(mediaDevices.addEventListener).toHaveBeenCalledWith(
      'devicechange',
      expect.any(Function)
    );

    // Verify enumerateDevices was called during initialization once
    expect(mediaDevices.enumerateDevices).toHaveBeenCalledTimes(1);

    // Initial state should be empty
    expect(state.devices.length).toBe(0);

    // Wait for devices to load asynchronously
    await waitFor(() => {
      [state, api] = result.current;
      if (state.devices.length === 0) throw new Error('Devices not loaded yet');
    });

    // Verify devices were loaded correctly
    expect(state.devices).toEqual(devices);
  });

  it('should update devices when devicechange event triggers', async () => {
    expect.assertions(3);

    const { mediaDevices } = globalThis.navigator;

    // Import fresh store instance
    const devices$ = await importStore();

    const { result } = renderHook(() => devices$());

    let [state] = result.current;

    // Wait for initial load
    await waitFor(() => {
      [state] = result.current;
      if (state.devices.length === 0) throw new Error('Devices not loaded yet');
    });

    // Verify initial devices are loaded
    expect(state.devices).toEqual(devices);

    // Update mock to return new devices
    const newDevices = [
      { deviceId: 'audio-input-2', kind: 'audioInput', label: 'Microphone 2' },
      { deviceId: 'video-input-2', kind: 'videoInput', label: 'Camera 2' },
    ] as ClientSdkVideo.Device[];

    vi.mocked(clientSdkVideo.getDevices).mockImplementation(async (callback) => {
      await wait(0);
      callback(undefined, newDevices);
    });

    const newMediaDevicesInfo = [
      { deviceId: 'audio-input-2', kind: 'audioinput', label: 'Microphone 2' },
      { deviceId: 'video-input-2', kind: 'videoinput', label: 'Camera 2' },
    ] as MediaDeviceInfo[];

    vi.mocked(globalThis.navigator.mediaDevices.enumerateDevices).mockImplementation(() =>
      Promise.resolve(newMediaDevicesInfo)
    );

    // Extract listeners for devicechange
    const deviceChangeHandler = vi.mocked(mediaDevices.addEventListener).mock
      .calls[0][1] as EventListener;

    // Trigger devicechange event
    deviceChangeHandler(new Event('devicechange'));

    // Wait for state to update with new devices
    await waitFor(() => {
      [state] = result.current;
      if (state.devices[0]?.deviceId !== 'audio-input-2') {
        throw new Error('Devices not updated yet');
      }
    });

    // Verify devices were updated correctly
    expect(state.devices).toEqual(newDevices);

    // Verify enumerateDevices was called twice (initial + devicechange)
    expect(mediaDevices.enumerateDevices).toHaveBeenCalledTimes(2);
  });
});

// #region mocks
const clientSdkVideo = vi.hoisted(
  () =>
    ({
      getDevices: () => {
        throw new Error('Not implemented');
      },
      getAudioOutputDevices: () => {
        throw new Error('Not implemented');
      },
    }) as unknown as typeof ClientSdkVideo
);

vi.mock('@vonage/client-sdk-video', (): typeof ClientSdkVideo => {
  return clientSdkVideo;
});

const mediaDevicesInfo = [
  { deviceId: 'audio-input-1', kind: 'audioinput', label: 'Microphone 1' },
  { deviceId: 'video-input-1', kind: 'videoinput', label: 'Camera 1' },
] as MediaDeviceInfo[];

const devices = [
  { deviceId: 'audio-input-1', kind: 'audioInput', label: 'Microphone 1' },
  { deviceId: 'video-input-1', kind: 'videoInput', label: 'Camera 1' },
] as ClientSdkVideo.Device[];
// #endregion

/**
 * Import is made dynamic to avoid module caching between tests
 * This ensures each test gets a fresh instance of the store and that we can spy on module methods before the store is initialized
 */
async function importStore() {
  return (await import(`./DevicesStore?${crypto.randomUUID()}`)).default as typeof DeviceStore;
}
