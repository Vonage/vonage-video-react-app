import { vi, describe, it, expect, beforeEach } from 'vitest';
import setupDeviceStore from '.';
import { waitFor } from '@testing-library/dom';
import mediaDevices$ from '../../devices$';
import { setupPartialMock } from '@common-test/helpers';
import { SPY_MARK } from '@common/types';
import { setupWindowNavigatorMock } from '@web-test/fixtures';

describe('setupDeviceStore', () => {
  beforeEach(() => {
    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
      },
    });
  });

  it('should initialize device sync and register event listener', async () => {
    const api$ = makeApiClone();

    const cleanup = setupDeviceStore(api$);

    // Wait for the debounced function to execute (10ms debounce + some buffer)
    await waitFor(
      () => {
        expect(mediaDevices$.actions.syncMediaDevicesInfo).toHaveBeenCalled();
      },
      { timeout: 100 }
    );

    // Should call syncMediaDevicesInfo once on init
    expect(mediaDevices$.actions.syncMediaDevicesInfo).toHaveBeenCalledTimes(1);

    // Should register devicechange listener
    expect(navigator.mediaDevices.addEventListener).toHaveBeenCalledWith(
      'devicechange',
      expect.any(Function),
      expect.any(AbortController)
    );

    // Simulate devicechange event
    const deviceChangeHandler = vi.mocked(navigator.mediaDevices.addEventListener).mock
      .calls[0][1] as () => void;

    deviceChangeHandler();

    // Wait for the debounced call from devicechange event
    await waitFor(
      () => {
        expect(mediaDevices$.actions.syncMediaDevicesInfo).toHaveBeenCalledTimes(2);
      },
      { timeout: 100 }
    );

    // Get the AbortController that was passed to addEventListener
    const abortController = vi.mocked(navigator.mediaDevices.addEventListener).mock
      .calls[0][2] as AbortController;

    const abortSpy = vi.spyOn(abortController, 'abort');

    // Call cleanup
    cleanup?.();

    expect(abortSpy).toHaveBeenCalledTimes(1);
  });

  it('should return undefined when mediaDevices is not supported', () => {
    const api$ = makeApiClone();

    // Mock unsupported environment
    const originalMediaDevices = globalThis.navigator.mediaDevices;
    Object.defineProperty(globalThis.navigator, 'mediaDevices', {
      value: undefined,
      writable: true,
    });

    const cleanup = setupDeviceStore(api$);

    expect(cleanup).toBeUndefined();
    expect(mediaDevices$.actions.syncMediaDevicesInfo).not.toHaveBeenCalled();

    // Restore
    Object.defineProperty(globalThis.navigator, 'mediaDevices', {
      value: originalMediaDevices,
      writable: true,
    });
  });
});

function makeApiClone() {
  const { getMetadata, getState, setMetadata, setState, actions } = mediaDevices$;
  const clone = { getMetadata, getState, setMetadata, setState, actions };

  setupPartialMock('mediaDevices$.actions', mediaDevices$.actions, {
    syncMediaDevicesInfo: SPY_MARK,
    selectDevice: SPY_MARK,
  });

  setupPartialMock('mediaDevices$', clone, {
    getMetadata: SPY_MARK,
    getState: SPY_MARK,
    setMetadata: SPY_MARK,
  });

  return clone;
}
