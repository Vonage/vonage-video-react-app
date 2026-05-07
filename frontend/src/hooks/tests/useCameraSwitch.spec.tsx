import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { Publisher } from '@vonage/client-sdk-video';
import mediaDevices$ from '@core/stores/devices';
import frontendLogger from '../../logger';
import useCameraSwitch from '../useCameraSwitch';

const makePublisher = (overrides: Partial<Publisher> = {}) =>
  ({
    setVideoSource: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }) as unknown as Publisher;

describe('useCameraSwitch', () => {
  let selectDeviceSpy!: MockInstance;

  beforeEach(() => {
    selectDeviceSpy = vi.spyOn(mediaDevices$.actions, 'selectDevice').mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
      vi.spyOn(frontendLogger, 'reportError').mockImplementation(() => {});
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

  describe('switchCamera — setVideoSource throws', () => {
    it('sets cameraError and returns false when setVideoSource rejects', async () => {
      vi.spyOn(frontendLogger, 'reportError').mockImplementation(() => {});
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
      vi.spyOn(frontendLogger, 'reportError').mockImplementation(() => {});
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

  describe('dismissCameraError', () => {
    it('clears cameraError', async () => {
      vi.spyOn(frontendLogger, 'reportError').mockImplementation(() => {});
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
