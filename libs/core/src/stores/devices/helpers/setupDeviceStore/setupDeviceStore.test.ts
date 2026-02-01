import { vi, describe, it, expect } from 'vitest';
import setupDeviceStore from '.';
import type { DevicesAPI } from '../../types';
import { metadata } from '../../constants';

const actionsMock = vi.hoisted(() => {
  return {
    syncDevicesList: vi.fn(),
    syncMediaDevicesList: vi.fn(),
  };
});

vi.mock('../../actions', () => {
  return {
    default: () => actionsMock,
  };
});

describe('setupDeviceStore', () => {
  it('should initialize device sync and register event listener', () => {
    const addEventListenerSpy = vi
      .spyOn(globalThis.navigator.mediaDevices, 'addEventListener')
      .mockImplementation(() => {});

    const mockApi = createMockApi();

    const cleanup = setupDeviceStore(mockApi);

    expect(actionsMock.syncDevicesList).toHaveBeenCalledTimes(1);
    expect(actionsMock.syncMediaDevicesList).toHaveBeenCalledTimes(1);

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'devicechange',
      expect.any(Function),
      expect.any(AbortController)
    );

    // Simulate devicechange event
    const deviceChangeHandler = addEventListenerSpy.mock.calls[0][1] as () => void;
    deviceChangeHandler();

    expect(actionsMock.syncDevicesList).toHaveBeenCalledTimes(2);
    expect(actionsMock.syncMediaDevicesList).toHaveBeenCalledTimes(2);

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
      setAudioOutputDevice: vi.fn(),
    },
    getMetadata: vi.fn(metadata),
    getState: vi.fn().mockReturnValue({}),
  } as unknown as DevicesAPI;
}
