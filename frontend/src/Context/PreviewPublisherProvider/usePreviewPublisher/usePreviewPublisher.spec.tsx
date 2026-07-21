import { act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { hasMediaProcessorSupport, initPublisher, Publisher } from '@vonage/client-sdk-video';
import EventEmitter from 'node:events';
import { defaultAudioDevice, defaultVideoDevice } from '@utils/mockData/device';
import { DEVICE_ACCESS_STATUS } from '@utils/constants';
import { DEVICE_REACQUIRE_FALLBACK_MS } from '@utils/publisher/deviceAccess';
import usePreviewPublisher from './usePreviewPublisher';
import { resetMediaProcessorSupportCache } from '@utils/hasMediaProcessorSupport/hasMediaProcessorSupport';
import { makeTestProvider, providers, type ProviderOptions } from '@test/providers';
import renderAsyncHook from '@web-test/renderAsyncHook';
import composeProviders from '@web/helpers/composeProviders';
import SuspenseBoundary from '@web/components/SuspenseBoundary';
import { setupWindowNavigatorMock } from '@web-test/fixtures';

vi.mock('@vonage/client-sdk-video');

describe('usePreviewPublisher', () => {
  const mockPublisher = Object.assign(new EventEmitter(), {
    getAudioSource: () => defaultAudioDevice,
    getVideoSource: () => defaultVideoDevice,
    applyVideoFilter: vi.fn(),
    clearVideoFilter: vi.fn(),
  }) as unknown as Publisher;
  const mockedInitPublisher = vi.fn();
  const mockedHasMediaProcessorSupport = vi.fn();

  beforeEach(() => {
    resetMediaProcessorSupportCache();
    vi.spyOn(console, 'error').mockImplementation(vi.fn());

    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        enumerateDevices: Promise.resolve([]),
      },
    });

    const { permissions } = globalThis.navigator;

    vi.spyOn(permissions, 'query').mockResolvedValue({ state: 'granted' } as PermissionStatus);

    (initPublisher as unknown as Mock).mockImplementation(mockedInitPublisher);
    (hasMediaProcessorSupport as unknown as Mock).mockImplementation(
      mockedHasMediaProcessorSupport
    );
  });

  describe('initLocalPublisher', () => {
    it('should call initLocalPublisher', async () => {
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = await render();

      result.current.initLocalPublisher();

      expect(mockedInitPublisher).toHaveBeenCalled();
    });

    it('should log access denied errors', async () => {
      const error = new Error(
        "It hit me pretty hard, how there's no kind of sad in this world that will stop it turning."
      );
      error.name = 'OT_USER_MEDIA_ACCESS_DENIED';
      (initPublisher as unknown as Mock).mockImplementation((_, _args, callback) => {
        callback(error);
      });

      const { result } = await render();
      result.current.initLocalPublisher();
      expect(console.error).toHaveBeenCalledWith('initPublisher error: ', error);
    });

    it('should apply background high blur-sm when initialized and changed background', async () => {
      mockedHasMediaProcessorSupport.mockReturnValue(true);
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = await render();
      result.current.initLocalPublisher();

      await act(async () => {
        await result.current.changeBackground('high-blur');
      });
      expect(mockPublisher.applyVideoFilter).toHaveBeenCalledWith({
        type: 'backgroundBlur',
        blurStrength: 'high',
      });
    });

    it('should not replace background when initialized if the device does not support it', async () => {
      mockedHasMediaProcessorSupport.mockReturnValue(false);
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = await render();
      result.current.initLocalPublisher();
      expect(mockedInitPublisher).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          videoFilter: undefined,
        }),
        expect.any(Function)
      );
    });

    it('honors the stored intent on a fresh init so a never-muted device starts unmuted', async () => {
      // No stored mute → intended unmuted/on. A FRESH init (no prior denial) must honor that intent;
      // a deny→re-grant cycle instead brings the recovered device back on regardless of the prior
      // intent (covered separately below).
      localStorage.removeItem('audioSourceEnabled');
      localStorage.removeItem('videoSourceEnabled');
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = await render();

      result.current.initLocalPublisher();

      expect(mockedInitPublisher).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({ publishAudio: true, publishVideo: true }),
        expect.any(Function)
      );
    });

    it('re-initializes muted/off when the user had muted the device before (stored intent)', async () => {
      localStorage.setItem('audioSourceEnabled', 'false');
      localStorage.setItem('videoSourceEnabled', 'false');
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = await render();

      result.current.initLocalPublisher();

      expect(mockedInitPublisher).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({ publishAudio: false, publishVideo: false }),
        expect.any(Function)
      );

      localStorage.removeItem('audioSourceEnabled');
      localStorage.removeItem('videoSourceEnabled');
    });
  });

  describe('changeBackground', () => {
    let result: ReturnType<typeof usePreviewPublisher>;

    beforeEach(async () => {
      mockedHasMediaProcessorSupport.mockReturnValue(true);
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const renderResult = await render();

      result = renderResult.result.current;

      act(() => {
        result.initLocalPublisher();
      });

      (mockPublisher.applyVideoFilter as Mock).mockClear();
      (mockPublisher.clearVideoFilter as Mock).mockClear();
    });

    it('applies low blur-sm filter', async () => {
      await act(async () => {
        await result.changeBackground('low-blur');
      });
      expect(mockPublisher.applyVideoFilter).toHaveBeenCalledWith({
        type: 'backgroundBlur',
        blurStrength: 'low',
      });
    });

    it('applies background replacement with image', async () => {
      await act(async () => {
        await result.changeBackground('bg1.jpg');
      });
      expect(mockPublisher.applyVideoFilter).toHaveBeenCalledWith({
        type: 'backgroundReplacement',
        backgroundImgUrl: expect.stringContaining('bg1.jpg'),
      });
    });

    it('clears video filter for unknown option', async () => {
      await act(async () => {
        await result.changeBackground('none');
      });
    });

    it('logs an error if applyBackgroundFilter rejects', async () => {
      mockPublisher.applyVideoFilter = vi.fn(() => {
        throw new Error('Simulated internal failure');
      });

      const { result: res } = await render();
      await act(async () => {
        res.current.initLocalPublisher();
        await res.current.changeBackground('low-blur');
      });

      expect(console.error).toHaveBeenCalledWith('Failed to apply background filter.');
    });
  });

  describe('on accessDenied', () => {
    const mockQuery = vi.fn();
    let mockedPermissionStatus: { onchange: null | (() => void); status: string };
    const emitAccessDeniedError = () => {
      // @ts-expect-error We simulate user denying microphone permissions in a browser.
      mockPublisher.emit('accessDenied', {
        // The SDK's real mid-call revocation message is lowercase — the device match
        // must be case-insensitive for this to be attributed to the microphone.
        message: 'microphone permission denied during the call',
      });
    };

    beforeEach(() => {
      mockedPermissionStatus = {
        onchange: null,
        status: 'prompt',
      };
      mockQuery.mockResolvedValue(mockedPermissionStatus);

      const { permissions } = globalThis.navigator;

      vi.spyOn(permissions, 'query').mockImplementation(mockQuery);
    });

    it('handles permission denial', async () => {
      mockedInitPublisher.mockReturnValue(mockPublisher);

      const { result } = await render();

      act(() => {
        result.current.initLocalPublisher();
      });

      expect(result.current.accessStatus).not.toBe(DEVICE_ACCESS_STATUS.REJECTED);

      // Isolate the denial handler's own permission query from any queries made during mount.
      mockQuery.mockClear();

      act(() => {
        emitAccessDeniedError();
      });

      await waitFor(() => {
        expect(result.current.accessStatus).toBe(DEVICE_ACCESS_STATUS.REJECTED);
        // The denied device must be identified as the microphone, not the camera fallback.
        expect(mockQuery).toHaveBeenCalledWith({ name: 'microphone' });
        // The blocked device is surfaced so the waiting room can badge it (Google Meet style),
        // while the (unmentioned) camera is left untouched.
        expect(result.current.deniedDevices).toEqual({ microphone: true, camera: false });
      });
    });

    it('does not flag a still-granted camera when only the microphone is blocked', async () => {
      // Reproduces a mic-only denial: the generic init message names no device, so the seed flags
      // BOTH. The authoritative permission query must correct that over-seed so the granted camera
      // is never badged.
      mockQuery.mockImplementation(({ name }: { name: string }) =>
        Promise.resolve({
          onchange: null,
          state: name === 'microphone' ? 'denied' : 'granted',
        } as unknown as PermissionStatus)
      );
      mockedInitPublisher.mockReturnValue(mockPublisher);

      const { result } = await render();
      act(() => {
        result.current.initLocalPublisher();
      });

      act(() => {
        // @ts-expect-error Simulate the SDK reporting a generic denial that mis-seeds to camera.
        mockPublisher.emit('accessDenied', { message: 'OT_USER_MEDIA_ACCESS_DENIED' });
      });

      await waitFor(() => {
        expect(result.current.deniedDevices).toEqual({ microphone: true, camera: false });
      });
    });

    it('retries with a video-only request when only the microphone is blocked', async () => {
      // Reproduces mic-blocked / camera-granted. The SDK's combined getUserMedia fails on the mic,
      // so the first init dies; the publisher must retry requesting only the granted camera so the
      // preview still comes up (rather than sitting dark) while the mic stays badged.
      localStorage.removeItem('audioSourceEnabled');
      localStorage.removeItem('videoSourceEnabled');
      mockQuery.mockImplementation(({ name }: { name: string }) =>
        Promise.resolve({
          onchange: null,
          state: name === 'microphone' ? 'denied' : 'granted',
        } as unknown as PermissionStatus)
      );

      const capturedOptions: Array<{ publishAudio?: boolean; publishVideo?: boolean }> = [];
      (initPublisher as unknown as Mock).mockImplementation(
        (
          _dependency: unknown,
          options: { publishAudio?: boolean },
          callback?: (e: Error) => void
        ) => {
          capturedOptions.push(options);
          if (capturedOptions.length === 1) {
            // Fail the first (combined) attempt asynchronously, as the real SDK does.
            queueMicrotask(() => {
              const error = Object.assign(new Error('denied'), {
                name: 'OT_USER_MEDIA_ACCESS_DENIED',
              });
              callback?.(error);
              // @ts-expect-error We simulate the SDK's accessDenied event for the blocked mic.
              mockPublisher.emit('accessDenied', { message: 'OT_USER_MEDIA_ACCESS_DENIED' });
            });
          }
          return mockPublisher;
        }
      );

      const { result } = await render();
      act(() => {
        result.current.initLocalPublisher();
      });

      await waitFor(() => {
        expect(capturedOptions.length).toBeGreaterThanOrEqual(2);
        const retry = capturedOptions[capturedOptions.length - 1];
        expect(retry.publishAudio).toBe(false);
        expect(retry.publishVideo).toBe(true);
      });
    });

    it('brings a re-granted device back on (unmuted), even if it was muted before', async () => {
      // Intent OFF for the mic (the user had muted it before the denial).
      localStorage.setItem('audioSourceEnabled', 'false');
      localStorage.removeItem('videoSourceEnabled');

      let microphoneChangeHandler: (() => void) | undefined;
      let microphoneStatus: { state: string } | undefined;
      mockQuery.mockImplementation(({ name }: { name: string }) => {
        const status = {
          state: name === 'microphone' ? 'denied' : 'granted',
          addEventListener: (event: string, handler: () => void) => {
            if (name === 'microphone' && event === 'change') {
              microphoneChangeHandler = handler;
            }
          },
          removeEventListener: () => {},
        };
        if (name === 'microphone') {
          microphoneStatus = status;
        }
        return Promise.resolve(status as unknown as PermissionStatus);
      });

      const capturedOptions: Array<{ publishAudio?: boolean; publishVideo?: boolean }> = [];
      (initPublisher as unknown as Mock).mockImplementation(
        (_dependency: unknown, options: { publishAudio?: boolean }) => {
          capturedOptions.push(options);
          return mockPublisher;
        }
      );

      const { result } = await render();
      act(() => {
        result.current.initLocalPublisher();
      });
      act(() => {
        emitAccessDeniedError();
      });

      await waitFor(() => {
        expect(result.current.deniedDevices).toEqual({ microphone: true, camera: false });
        expect(typeof microphoneChangeHandler).toBe('function');
      });

      // Re-grant the microphone, then re-init in place (the waiting room does destroy+init on
      // ACCESS_CHANGED; here we stand in for that).
      capturedOptions.length = 0;
      act(() => {
        microphoneStatus!.state = 'granted';
        microphoneChangeHandler?.();
      });
      act(() => {
        // @ts-expect-error stand in for the SDK 'destroyed' event clearing the publisher ref.
        mockPublisher.emit('destroyed');
      });
      act(() => {
        result.current.initLocalPublisher();
      });

      await waitFor(() => {
        const latestOptions = capturedOptions[capturedOptions.length - 1];
        // The re-granted mic comes back ON (unmuted) despite the stored 'off' intent; the untouched
        // camera stays on.
        expect(latestOptions.publishAudio).toBe(true);
        expect(latestOptions.publishVideo).toBe(true);
      });

      // The on-intent is persisted (not just transient state) so it survives a whole-publisher
      // rebuild and carries into the call when the user joins.
      expect(localStorage.getItem('audioSourceEnabled')).toBe('true');
      expect(localStorage.getItem('videoSourceEnabled')).not.toBe('false');

      localStorage.removeItem('audioSourceEnabled');
    });

    it('keeps the first re-granted device on when the second device is re-granted next', async () => {
      // Both devices denied then re-granted one at a time (the normal site-settings flow). The first
      // recovery must not be silently re-muted when the second device's re-grant rebuilds the whole
      // publisher.
      localStorage.setItem('audioSourceEnabled', 'false');
      localStorage.setItem('videoSourceEnabled', 'false');

      const statuses: Record<string, { state: string }> = {};
      const changeHandlers: Record<string, (() => void) | undefined> = {};
      mockQuery.mockImplementation(({ name }: { name: string }) => {
        const status = {
          state: 'denied',
          addEventListener: (event: string, handler: () => void) => {
            if (event === 'change') {
              changeHandlers[name] = handler;
            }
          },
          removeEventListener: () => {},
        };
        statuses[name] = status;
        return Promise.resolve(status as unknown as PermissionStatus);
      });

      const capturedOptions: Array<{ publishAudio?: boolean; publishVideo?: boolean }> = [];
      (initPublisher as unknown as Mock).mockImplementation(
        (_dependency: unknown, options: { publishAudio?: boolean }) => {
          capturedOptions.push(options);
          return mockPublisher;
        }
      );

      const { result } = await render();
      act(() => {
        result.current.initLocalPublisher();
      });
      act(() => {
        emitAccessDeniedError();
      });
      await waitFor(() => {
        expect(result.current.deniedDevices).toEqual({ microphone: true, camera: true });
      });

      // Re-grant the microphone first, then rebuild.
      act(() => {
        statuses.microphone.state = 'granted';
        changeHandlers.microphone?.();
      });
      act(() => {
        // @ts-expect-error stand in for the SDK 'destroyed' event clearing the publisher ref.
        mockPublisher.emit('destroyed');
      });
      act(() => {
        result.current.initLocalPublisher();
      });

      // Now re-grant the camera and rebuild again.
      capturedOptions.length = 0;
      act(() => {
        statuses.camera.state = 'granted';
        changeHandlers.camera?.();
      });
      act(() => {
        // @ts-expect-error stand in for the SDK 'destroyed' event clearing the publisher ref.
        mockPublisher.emit('destroyed');
      });
      act(() => {
        result.current.initLocalPublisher();
      });

      await waitFor(() => {
        const latestOptions = capturedOptions[capturedOptions.length - 1];
        // The mic stays on from its own earlier re-grant; the camera is now on too.
        expect(latestOptions.publishAudio).toBe(true);
        expect(latestOptions.publishVideo).toBe(true);
      });

      localStorage.removeItem('audioSourceEnabled');
      localStorage.removeItem('videoSourceEnabled');
    });

    it('reacquireDevice recovers a still-denied device after the fallback delay (Safari fallback)', async () => {
      localStorage.setItem('audioSourceEnabled', 'false');
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = await render({
        initialValue: { deniedDevices: { microphone: true, camera: true } },
      });

      vi.useFakeTimers();
      act(() => {
        result.current.reacquireDevice('microphone');
      });
      act(() => {
        vi.advanceTimersByTime(DEVICE_REACQUIRE_FALLBACK_MS);
      });
      vi.useRealTimers();

      // Safari never fires onchange, so the click fallback brings the mic back — on (unmuted)
      // and persisted — via ACCESS_CHANGED, without a page reload.
      expect(result.current.deniedDevices.microphone).toBe(false);
      expect(result.current.accessStatus).toBe(DEVICE_ACCESS_STATUS.ACCESS_CHANGED);
      expect(localStorage.getItem('audioSourceEnabled')).toBe('true');

      localStorage.removeItem('audioSourceEnabled');
    });

    it('reacquireDevice does nothing when the device is no longer denied (dedup with onchange)', async () => {
      mockedInitPublisher.mockReturnValue(mockPublisher);
      // No denied devices — stands in for Chrome, where onchange already recovered the device before
      // the fallback fires.
      const { result } = await render();

      vi.useFakeTimers();
      act(() => {
        result.current.reacquireDevice('microphone');
      });
      act(() => {
        vi.advanceTimersByTime(DEVICE_REACQUIRE_FALLBACK_MS);
      });
      vi.useRealTimers();

      expect(result.current.accessStatus).not.toBe(DEVICE_ACCESS_STATUS.ACCESS_CHANGED);
      expect(localStorage.getItem('audioSourceEnabled')).not.toBe('false');
    });

    it('does not throw on older, unsupported browsers', async () => {
      mockQuery.mockImplementation(() => {
        return Promise.reject(new Error('Whoops'));
      });
      mockedInitPublisher.mockReturnValue(mockPublisher);

      const { result } = await render();

      act(() => {
        result.current.initLocalPublisher();
      });

      expect(emitAccessDeniedError).not.toThrow();

      act(emitAccessDeniedError);

      expect(console.error).toHaveBeenCalledWith('Error querying permissions:', expect.any(Error));
    });
  });
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  previewPublisherContext?: ProviderOptions['PreviewPublisherContext'];
  initialValue?: Parameters<typeof usePreviewPublisher>[0];
};

async function render({ userContext, previewPublisherContext, initialValue }: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider([providers.user, providers.previewPublisher], {
    userContext,
    previewPublisherContext,
  });

  const composedWrapper = composeProviders(SuspenseBoundary, wrapper);

  const rendered = await renderAsyncHook(() => usePreviewPublisher(initialValue), {
    wrapper: composedWrapper,
  });

  return {
    ...rendered,
    ...context,
  };
}
