import { vi, describe, it, expect } from 'vitest';
import setupDeviceStore from './';

export type DevicesApi = import('../../devicesStore').DevicesApi;

describe('setupDeviceStore', () => {
  it('should initialize device sync and register event listener', () => {
    const addEventListenerSpy = vi
      .spyOn(globalThis.navigator.mediaDevices, 'addEventListener')
      .mockImplementation(() => {});

    const mockApi = createMockApi();

    const cleanup = setupDeviceStore(mockApi);

    expect(mockApi.actions.syncDevicesList).toHaveBeenCalledTimes(1);
    expect(mockApi.actions.syncMediaDevicesList).toHaveBeenCalledTimes(1);

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'devicechange',
      expect.any(Function),
      expect.any(AbortController)
    );

    // Simulate devicechange event
    const deviceChangeHandler = addEventListenerSpy.mock.calls[0][1] as () => void;
    deviceChangeHandler();

    expect(mockApi.actions.syncDevicesList).toHaveBeenCalledTimes(2);
    expect(mockApi.actions.syncMediaDevicesList).toHaveBeenCalledTimes(2);

    // Get the AbortController that was passed to addEventListener
    const abortController = addEventListenerSpy.mock.calls[0][2] as AbortController;
    const abortSpy = vi.spyOn(abortController, 'abort');

    // Call cleanup
    cleanup!();

    expect(abortSpy).toHaveBeenCalledTimes(1);
  });
});

function createMockApi() {
  return {
    actions: {
      syncDevicesList: vi.fn(),
      syncMediaDevicesList: vi.fn(),
      syncAudioOutputDevicesList: vi.fn().mockResolvedValue([]),
      setAudioOutputDevice: vi.fn(),
    },
    getMetadata: vi.fn().mockReturnValue({}),
    getState: vi.fn().mockReturnValue({}),
  } as unknown as DevicesApi;
}
