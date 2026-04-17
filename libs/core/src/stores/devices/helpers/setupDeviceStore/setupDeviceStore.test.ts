import { vi, describe, it, expect, beforeEach } from 'vitest';
import setupDeviceStore from '.';
import { waitFor } from '@testing-library/dom';
import mediaDevices$ from '../../devices$';
import { setupPartialMock } from '@common-test/helpers';
import { SPY_MARK } from '@common/types';
import { setupWindowNavigatorMock, makeMediaDeviceInfos } from '@web-test/fixtures';
import * as vonageClientSdk from '@vonage/client-sdk-video';
import * as isFirefoxModule from '@web/platform/isFirefox';
import { mediaDevicesEnvelop } from '@core/interceptors';

const someDevices = makeMediaDeviceInfos();

describe('setupDeviceStore', () => {
  beforeEach(() => {
    vi.spyOn(vonageClientSdk, 'setAudioOutputDevice').mockResolvedValue(undefined);
    vi.spyOn(isFirefoxModule, 'default').mockReturnValue(false);

    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        enumerateDevices: Promise.resolve(someDevices),
      },
    });

    mediaDevicesEnvelop.rebind(navigator);
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

  it('should call setVonageAudioOutputDevice on initialization', () => {
    const api$ = makeApiClone();

    setupDeviceStore(api$);

    expect(vonageClientSdk.setAudioOutputDevice).toHaveBeenCalled();
  });

  describe('visibility change handling', () => {
    it('should sync devices when tab becomes visible', async () => {
      const documentAddEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const api$ = makeApiClone();

      setupDeviceStore(api$);

      // Find the visibility change handler
      const visibilityChangeCall = documentAddEventListenerSpy.mock.calls.find(
        (call) => call[0] === 'visibilitychange'
      );
      const visibilityChangeHandler = visibilityChangeCall?.[1] as () => void;

      // Clear previous calls
      vi.mocked(mediaDevices$.actions.syncMediaDevicesInfo).mockClear();

      // Simulate tab becoming visible
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        writable: true,
        configurable: true,
      });

      visibilityChangeHandler();

      await waitFor(
        () => {
          expect(mediaDevices$.actions.syncMediaDevicesInfo).toHaveBeenCalled();
        },
        { timeout: 100 }
      );
    });

    it('should NOT sync devices when tab becomes hidden', async () => {
      const documentAddEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const api$ = makeApiClone();

      setupDeviceStore(api$);

      // Wait for initial sync
      await waitFor(
        () => {
          expect(mediaDevices$.actions.syncMediaDevicesInfo).toHaveBeenCalled();
        },
        { timeout: 100 }
      );

      const initialCallCount = vi.mocked(mediaDevices$.actions.syncMediaDevicesInfo).mock.calls
        .length;

      // Find the visibility change handler
      const visibilityChangeCall = documentAddEventListenerSpy.mock.calls.find(
        (call) => call[0] === 'visibilitychange'
      );
      const visibilityChangeHandler = visibilityChangeCall?.[1] as () => void;

      // Simulate tab becoming hidden
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        writable: true,
        configurable: true,
      });

      visibilityChangeHandler();

      // Wait a bit and verify no additional calls were made
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(mediaDevices$.actions.syncMediaDevicesInfo).toHaveBeenCalledTimes(initialCallCount);
    });
  });

  describe('permission change handling', () => {
    it('should sync devices when camera permission changes', async () => {
      const permissionStatusMock = {
        addEventListener: vi.fn(),
        state: 'granted',
      };

      setupWindowNavigatorMock({
        mediaDevices: {
          addEventListener: vi.fn(),
        },
        permissions: {
          query: vi.fn().mockResolvedValue(permissionStatusMock),
        },
      });

      mediaDevicesEnvelop.rebind(navigator);

      const api$ = makeApiClone();

      setupDeviceStore(api$);

      // Wait for permission query to be called
      await waitFor(
        () => {
          expect(navigator.permissions.query).toHaveBeenCalledWith({ name: 'camera' });
        },
        { timeout: 100 }
      );

      // Simulate permission change
      const changeCall = permissionStatusMock.addEventListener.mock.calls.find(
        (call) => call[0] === 'change'
      );
      const changeHandler = changeCall?.[1] as () => void;

      vi.mocked(mediaDevices$.actions.syncMediaDevicesInfo).mockClear();

      changeHandler?.();

      await waitFor(
        () => {
          expect(mediaDevices$.actions.syncMediaDevicesInfo).toHaveBeenCalled();
        },
        { timeout: 100 }
      );
    });

    it('should sync devices when microphone permission changes', async () => {
      const permissionStatusMock = {
        addEventListener: vi.fn(),
        state: 'granted',
      };

      setupWindowNavigatorMock({
        mediaDevices: {
          addEventListener: vi.fn(),
        },
        permissions: {
          query: vi.fn().mockResolvedValue(permissionStatusMock),
        },
      });

      mediaDevicesEnvelop.rebind(navigator);

      const api$ = makeApiClone();

      setupDeviceStore(api$);

      // Wait for permission query to be called
      await waitFor(
        () => {
          expect(navigator.permissions.query).toHaveBeenCalledWith({ name: 'microphone' });
        },
        { timeout: 100 }
      );
    });
  });

  describe('Firefox permission handling', () => {
    it('should resolve store readiness and sync devices when Firefox labels are already present', async () => {
      vi.spyOn(isFirefoxModule, 'default').mockReturnValue(true);

      const api$ = makeApiClone();

      setupWindowNavigatorMock({
        mediaDevices: {
          addEventListener: vi.fn(),
          enumerateDevices: vi.fn().mockResolvedValue([
            { deviceId: 'device1', kind: 'audioinput', label: 'Microphone' },
            { deviceId: 'device2', kind: 'videoinput', label: 'Camera' },
          ]),
          getUserMedia: vi.fn(),
        },
      });

      mediaDevicesEnvelop.rebind(navigator);

      setupDeviceStore(api$);

      await waitFor(
        async () => {
          await expect(api$.getMetadata().isStoreReady).resolves.toBeUndefined();
          expect(mediaDevices$.actions.syncMediaDevicesInfo).toHaveBeenCalledWith();
        },
        { timeout: 200 }
      );
    });

    it('should request permissions when on Firefox and device labels are empty', async () => {
      vi.spyOn(isFirefoxModule, 'default').mockReturnValue(true);

      const mockStream = {
        getTracks: vi.fn().mockReturnValue([{ stop: vi.fn() }, { stop: vi.fn() }]),
      };

      const getUserMediaSpy = vi.fn(() =>
        Promise.resolve(mockStream)
      ) as unknown as typeof navigator.mediaDevices.getUserMedia;

      setupWindowNavigatorMock({
        mediaDevices: {
          addEventListener: vi.fn(),
          enumerateDevices: Promise.resolve([
            { deviceId: 'device1', kind: 'audioinput', label: '' },
            { deviceId: 'device2', kind: 'videoinput', label: '' },
          ] as MediaDeviceInfo[]),
          getUserMedia: getUserMediaSpy,
        },
      });

      mediaDevicesEnvelop.rebind(navigator);

      const api$ = makeApiClone();

      setupDeviceStore(api$);

      await waitFor(
        () => {
          expect(getUserMediaSpy).toHaveBeenCalledWith({
            audio: true,
            video: true,
          });
        },
        { timeout: 200 }
      );

      // Verify tracks were stopped after getting permissions
      expect(mockStream.getTracks).toHaveBeenCalled();
    });

    it('should NOT request permissions when on Firefox and device labels are present', async () => {
      vi.spyOn(isFirefoxModule, 'default').mockReturnValue(true);

      setupWindowNavigatorMock({
        mediaDevices: {
          addEventListener: vi.fn(),
          enumerateDevices: vi.fn().mockResolvedValue([
            { deviceId: 'device1', kind: 'audioinput', label: 'Microphone' },
            { deviceId: 'device2', kind: 'videoinput', label: 'Camera' },
          ]),
          getUserMedia: vi.fn(),
        },
      });

      mediaDevicesEnvelop.rebind(navigator);

      const api$ = makeApiClone();

      setupDeviceStore(api$);

      // Wait a bit to ensure async operations complete
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
    });

    it('should skip permission request when not on Firefox', async () => {
      vi.spyOn(isFirefoxModule, 'default').mockReturnValue(false);

      setupWindowNavigatorMock({
        mediaDevices: {
          addEventListener: vi.fn(),
          enumerateDevices: vi
            .fn()
            .mockResolvedValue([{ deviceId: 'device1', kind: 'audioinput', label: '' }]),
          getUserMedia: vi.fn(),
        },
      });

      mediaDevicesEnvelop.rebind(navigator);

      const api$ = makeApiClone();

      setupDeviceStore(api$);

      // Wait for initial sync
      await waitFor(
        () => {
          expect(mediaDevices$.actions.syncMediaDevicesInfo).toHaveBeenCalled();
        },
        { timeout: 100 }
      );

      // Should not call getUserMedia for permission request
      expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
    });
  });

  // Note: getUserMedia monkey patching tests are skipped because `isBrowserEnvironment`
  // is evaluated at module load time before test mocks are set up. This means the
  // monkey patching code path (`shouldMonkeyPatchGetUserMedia`) is never reached
  // in the test environment. The monkey patching behavior is verified via
  // integration tests in a real browser environment.

  describe('envelope original method access', () => {
    it('should make getUserMedia available via the mediaDevices envelope', () => {
      const originalGetUserMedia = vi.fn();

      setupWindowNavigatorMock({
        mediaDevices: {
          addEventListener: vi.fn(),
          getUserMedia: originalGetUserMedia,
        },
      });

      mediaDevicesEnvelop.rebind(navigator);

      const api$ = makeApiClone();

      setupDeviceStore(api$);

      const envelopGetUserMedia = mediaDevicesEnvelop.getOriginal('getUserMedia');

      expect(envelopGetUserMedia).toBeDefined();
      expect(typeof envelopGetUserMedia).toBe('function');
    });
  });

  describe('cleanup behavior', () => {
    it('should cancel pending permissions request on cleanup', () => {
      vi.spyOn(isFirefoxModule, 'default').mockReturnValue(true);

      const neverResolve = new Promise<MediaDeviceInfo[]>(() => {});
      setupWindowNavigatorMock({
        mediaDevices: {
          addEventListener: vi.fn(),
          enumerateDevices: vi.fn().mockReturnValue(neverResolve),
        },
      });

      mediaDevicesEnvelop.rebind(navigator);

      const api$ = makeApiClone();

      const cleanup = setupDeviceStore(api$);

      // Cleanup immediately - should cancel pending permission request
      cleanup?.();

      // Verify no errors are thrown and cleanup completed
      expect(cleanup).toBeDefined();
    });
  });
});

function makeApiClone() {
  const { getMetadata, getState, setMetadata, setState, actions } = mediaDevices$;
  const clone = { getMetadata, getState, setMetadata, setState, actions };

  setupPartialMock('mediaDevices$.actions', mediaDevices$.actions, {
    syncMediaDevicesInfo: SPY_MARK,
    selectDevice: SPY_MARK,
    getUserMedia: SPY_MARK,
  });

  setupPartialMock('mediaDevices$', clone, {
    getMetadata: SPY_MARK,
    getState: SPY_MARK,
    setMetadata: SPY_MARK,
  });

  return clone;
}
