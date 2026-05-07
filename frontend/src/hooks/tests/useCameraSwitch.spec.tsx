import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { Publisher } from '@vonage/client-sdk-video';
import mediaDevices$ from '@core/stores/devices';
import frontendLogger from '../../logger';
import useCameraSwitch from '../useCameraSwitch';

const makeLiveTrack = (overrides: Partial<MediaStreamTrack> = {}): MediaStreamTrack =>
  ({
    readyState: 'live',
    muted: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    ...overrides,
  }) as unknown as MediaStreamTrack;

const makePublisher = (overrides: Partial<Publisher> = {}) =>
  ({
    setVideoSource: vi.fn().mockResolvedValue(undefined),
    getVideoSource: vi.fn().mockReturnValue({
      deviceId: 'device-1',
      type: 'camera',
      track: makeLiveTrack(),
    }),
    ...overrides,
  }) as unknown as Publisher;

describe('useCameraSwitch', () => {
  let selectDeviceSpy!: MockInstance;

  beforeEach(() => {
    selectDeviceSpy = vi.spyOn(mediaDevices$.actions, 'selectDevice').mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('switchCamera — guard clauses', () => {
    it('returns false and skips all calls when publisher is null', async () => {
      const { result } = renderHook(() => useCameraSwitch(null));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.switchCamera('device-1');
      });

      expect(success).toBe(false);
      expect(selectDeviceSpy).not.toHaveBeenCalled();
    });

    it('returns false and skips all calls when deviceId is empty', async () => {
      const publisher = makePublisher();
      const { result } = renderHook(() => useCameraSwitch(publisher));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.switchCamera('');
      });

      expect(success).toBe(false);
      expect(publisher.setVideoSource).not.toHaveBeenCalled();
      expect(selectDeviceSpy).not.toHaveBeenCalled();
    });
  });

  describe('switchCamera — happy path', () => {
    it('calls setVideoSource with the given deviceId', async () => {
      const publisher = makePublisher();
      const { result } = renderHook(() => useCameraSwitch(publisher));

      await act(async () => {
        await result.current.switchCamera('device-1');
      });

      expect(publisher.setVideoSource).toHaveBeenCalledWith('device-1');
    });

    it('calls selectDevice after successful setVideoSource', async () => {
      const publisher = makePublisher();
      const { result } = renderHook(() => useCameraSwitch(publisher));

      await act(async () => {
        await result.current.switchCamera('device-1');
      });

      expect(selectDeviceSpy).toHaveBeenCalledWith('videoinput', 'device-1');
    });

    it('returns true on success', async () => {
      const publisher = makePublisher();
      const { result } = renderHook(() => useCameraSwitch(publisher));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.switchCamera('device-1');
      });

      expect(success).toBe(true);
    });

    it('clears cameraError on successful switch after a previous failure', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const setVideoSource = vi
        .fn()
        .mockRejectedValueOnce(new Error('OT_HARDWARE_UNAVAILABLE'))
        .mockResolvedValue(undefined);
      const publisher = makePublisher({ setVideoSource });
      const { result } = renderHook(() => useCameraSwitch(publisher));

      await act(async () => {
        await result.current.switchCamera('device-1');
      });
      await waitFor(() =>
        expect(result.current.cameraError).toBe('devices.video.camera.unavailable')
      );

      await act(async () => {
        await result.current.switchCamera('device-2');
      });
      await waitFor(() => expect(result.current.cameraError).toBeNull());
    });
  });

  describe('switchCamera — setVideoSource throws (explicit error)', () => {
    it('sets cameraError and returns false when setVideoSource rejects', async () => {
      const publisher = makePublisher({
        setVideoSource: vi.fn().mockRejectedValue(new Error('OT_HARDWARE_UNAVAILABLE')),
      });
      const { result } = renderHook(() => useCameraSwitch(publisher));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.switchCamera('device-1');
      });

      expect(success).toBe(false);
      await waitFor(() =>
        expect(result.current.cameraError).toBe('devices.video.camera.unavailable')
      );
    });

    it('does not call selectDevice when setVideoSource rejects', async () => {
      const publisher = makePublisher({
        setVideoSource: vi.fn().mockRejectedValue(new Error('OT_HARDWARE_UNAVAILABLE')),
      });
      const { result } = renderHook(() => useCameraSwitch(publisher));

      await act(async () => {
        await result.current.switchCamera('device-1');
      });

      expect(selectDeviceSpy).not.toHaveBeenCalled();
    });

    it('reports the error via frontendLogger when setVideoSource rejects', async () => {
      const reportErrorSpy = vi.spyOn(frontendLogger, 'reportError').mockImplementation(() => {});
      const err = new Error('OT_HARDWARE_UNAVAILABLE');
      const publisher = makePublisher({
        setVideoSource: vi.fn().mockRejectedValue(err),
      });
      const { result } = renderHook(() => useCameraSwitch(publisher));

      await act(async () => {
        await result.current.switchCamera('device-1');
      });

      expect(reportErrorSpy).toHaveBeenCalledWith(err, {
        source: 'useCameraSwitch: setVideoSource',
      });
    });
  });

  describe('switchCamera — silent track failure (black screen, no thrown error)', () => {
    it('sets cameraError and returns false when track is null', async () => {
      const publisher = makePublisher({
        getVideoSource: vi.fn().mockReturnValue({ deviceId: null, type: null, track: null }),
      });
      const { result } = renderHook(() => useCameraSwitch(publisher));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.switchCamera('device-1');
      });

      expect(success).toBe(false);
      await waitFor(() =>
        expect(result.current.cameraError).toBe('devices.video.camera.hardware-error')
      );
      expect(selectDeviceSpy).not.toHaveBeenCalled();
    });

    it('sets cameraError and returns false when track.readyState is ended', async () => {
      const publisher = makePublisher({
        getVideoSource: vi.fn().mockReturnValue({
          deviceId: 'device-1',
          type: 'camera',
          track: makeLiveTrack({ readyState: 'ended' }),
        }),
      });
      const { result } = renderHook(() => useCameraSwitch(publisher));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.switchCamera('device-1');
      });

      expect(success).toBe(false);
      await waitFor(() =>
        expect(result.current.cameraError).toBe('devices.video.camera.hardware-error')
      );
      expect(selectDeviceSpy).not.toHaveBeenCalled();
    });

    it('sets cameraError and returns false when track stays muted (black screen)', async () => {
      vi.useFakeTimers();

      const mutedTrack = makeLiveTrack({
        muted: true,
        // addEventListener is a no-op — no unmute event ever fires
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      const publisher = makePublisher({
        getVideoSource: vi
          .fn()
          .mockReturnValue({ deviceId: 'device-1', type: 'camera', track: mutedTrack }),
      });
      const { result } = renderHook(() => useCameraSwitch(publisher));

      const switchPromise = result.current.switchCamera('device-1');

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      const success = await switchPromise;

      expect(success).toBe(false);
      expect(result.current.cameraError).toBe('devices.video.camera.no-video');
      expect(selectDeviceSpy).not.toHaveBeenCalled();
    });

    it('returns true and calls selectDevice when muted track fires unmute before timeout', async () => {
      // Mock fires the unmute callback in the next microtask after addEventListener is called,
      // simulating a camera that briefly mutes then starts delivering frames.
      const mutedTrack = makeLiveTrack({
        muted: true,
        addEventListener: vi.fn().mockImplementation((event: string, cb: () => void) => {
          if (event === 'unmute') void Promise.resolve().then(cb);
        }),
        removeEventListener: vi.fn(),
      });
      const publisher = makePublisher({
        getVideoSource: vi
          .fn()
          .mockReturnValue({ deviceId: 'device-1', type: 'camera', track: mutedTrack }),
      });
      const { result } = renderHook(() => useCameraSwitch(publisher));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.switchCamera('device-1');
      });

      expect(success).toBe(true);
      expect(result.current.cameraError).toBeNull();
      expect(selectDeviceSpy).toHaveBeenCalledWith('videoinput', 'device-1');
    });
  });

  describe('dismissCameraError', () => {
    it('clears cameraError', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const publisher = makePublisher({
        setVideoSource: vi.fn().mockRejectedValue(new Error('OT_HARDWARE_UNAVAILABLE')),
      });
      const { result } = renderHook(() => useCameraSwitch(publisher));

      await act(async () => {
        await result.current.switchCamera('device-1');
      });
      await waitFor(() =>
        expect(result.current.cameraError).toBe('devices.video.camera.unavailable')
      );

      act(() => {
        result.current.dismissCameraError();
      });

      expect(result.current.cameraError).toBeNull();
    });
  });
});
