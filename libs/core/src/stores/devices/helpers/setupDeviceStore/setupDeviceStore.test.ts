import { vi, describe, it, expect } from 'vitest';
import setupDeviceStore from '.';
import type { DevicesAPI } from '../../types';
import { metadata } from '../../constants';

describe('setupDeviceStore', () => {
  it('should initialize device sync and register event listener', () => {
    const mockApi: DevicesAPI = createMockApi();

    const addEventListenerSpy = vi
      .spyOn(globalThis.navigator.mediaDevices, 'addEventListener')
      .mockImplementation(() => {});

    const cleanup = setupDeviceStore(mockApi);

    // Should call syncMediaDevicesInfo once on init
    expect(mockApi.actions.syncMediaDevicesInfo).toHaveBeenCalledTimes(1);

    // Should register devicechange listener
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'devicechange',
      expect.any(Function),
      expect.any(AbortController)
    );

    // Simulate devicechange event
    const deviceChangeHandler = addEventListenerSpy.mock.calls[0][1] as () => void;
    deviceChangeHandler();

    // Should call syncMediaDevicesInfo again on devicechange
    expect(mockApi.actions.syncMediaDevicesInfo).toHaveBeenCalledTimes(2);

    // Get the AbortController that was passed to addEventListener
    const abortController = addEventListenerSpy.mock.calls[0][2] as AbortController;
    const abortSpy = vi.spyOn(abortController, 'abort');

    // Call cleanup
    cleanup?.();

    expect(abortSpy).toHaveBeenCalledTimes(1);

    addEventListenerSpy.mockRestore();
  });

  it('should return undefined when mediaDevices is not supported', () => {
    const mockApi = createMockApi();

    // Mock unsupported environment
    const originalMediaDevices = globalThis.navigator.mediaDevices;
    Object.defineProperty(globalThis.navigator, 'mediaDevices', {
      value: undefined,
      writable: true,
    });

    const cleanup = setupDeviceStore(mockApi);

    expect(cleanup).toBeUndefined();
    expect(mockApi.actions.syncMediaDevicesInfo).not.toHaveBeenCalled();

    // Restore
    Object.defineProperty(globalThis.navigator, 'mediaDevices', {
      value: originalMediaDevices,
      writable: true,
    });
  });
});

function createMockApi(): DevicesAPI {
  return {
    actions: {
      syncMediaDevicesInfo: vi.fn(),
      selectDevice: vi.fn(),
    },
    getMetadata: vi.fn(() => metadata()),
    getState: vi.fn().mockReturnValue({
      mediaDeviceInfo: [],
      selection: new Map(),
    }),
    setMetadata: vi.fn(),
  } as unknown as DevicesAPI;
}
