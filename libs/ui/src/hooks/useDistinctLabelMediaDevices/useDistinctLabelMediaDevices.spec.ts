import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { MediaDeviceInfoJSON } from '@web/types';
import useDistinctLabelMediaDevices from '.';
import mediaDevices$ from '@core/stores/devices';
import { makeMediaDeviceInfos, setupWindowNavigatorMock } from '@web-test/fixtures';
import { mediaDevicesEnvelop } from '@core/interceptors';

const devices = makeMediaDeviceInfos();

describe('useDistinctLabelMediaDevices', () => {
  beforeEach(() => {
    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        enumerateDevices: Promise.resolve(devices),
        getUserMedia: Promise.resolve({
          getVideoTracks: () => [],
          getAudioTracks: () => [],
        } as unknown as MediaStream),
      },
    });

    mediaDevicesEnvelop.rebind(navigator);

    mediaDevices$.reset();
  });

  it('should return audioinput devices with cleaned labels', async () => {
    const { result } = renderHook<MediaDeviceInfoJSON[], void>(() =>
      useDistinctLabelMediaDevices('audioinput')
    );

    await waitFor(() => {
      expect(result.current.length).toBeGreaterThan(0);
    });

    result.current.forEach((device) => {
      expect(device.kind).toBe('audioinput');
      // Labels should be cleaned (no technical IDs)
      expect(device.label).not.toMatch(/\([0-9A-Fa-f]{4}:[0-9A-Fa-f]{4}\)$/);
    });
  });

  it('should return videoinput devices with cleaned labels', async () => {
    const { result } = renderHook<MediaDeviceInfoJSON[], void>(() =>
      useDistinctLabelMediaDevices('videoinput')
    );

    await waitFor(() => {
      expect(result.current.length).toBeGreaterThan(0);
    });

    result.current.forEach((device) => {
      expect(device.kind).toBe('videoinput');
    });
  });

  it('should support selector function', async () => {
    const { result } = renderHook(() =>
      useDistinctLabelMediaDevices('audioinput', (devices) => devices.length)
    );

    await waitFor(() => {
      expect(result.current).toBeGreaterThan(0);
    });
  });
});
