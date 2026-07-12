import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FacingMode } from '@common/types';
import { isMobile } from '@web/platform';
import {
  makeMediaDeviceInfos,
  frontCameraId,
  rearCameraId,
  setupWindowNavigatorMock,
} from '@web-test/fixtures';
import mediaDevices$ from '../../mediaDevices$';
import getMediaDevicesInfo$ from '.';

vi.mock('@web/platform', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@web/platform')>();

  return {
    ...actual,
    isMobile: vi.fn(() => false),
  };
});

const deviceWithoutId = {
  deviceId: '',
  label: 'device without id',
} as unknown as MediaDeviceInfo;

const { getMediaDevicesInfo } = getMediaDevicesInfo$(mediaDevices$);

describe('getMediaDevicesInfo', () => {
  beforeEach(() => {
    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        enumerateDevices: Promise.resolve([...makeMediaDeviceInfos(), deviceWithoutId]),
      },
    });

    mediaDevices$.reset();
  });

  it('filters devices without deviceId and infers facing mode on mobile videoinput labels', async () => {
    expect.assertions(5);

    vi.mocked(isMobile).mockReturnValue(true);

    const result = await getMediaDevicesInfo();

    expect(result.some((device) => !device.deviceId)).toBe(false);

    const frontCamera = result.find((device) => device.deviceId === frontCameraId);
    const rearCamera = result.find((device) => device.deviceId === rearCameraId);
    const externalCamera = result.find((device) => device.deviceId === 'video-input-3');

    expect(frontCamera?.inferredFacingMode).toBe(FacingMode.user);
    expect(rearCamera?.inferredFacingMode).toBe(FacingMode.environment);
    expect(externalCamera?.inferredFacingMode).toBe(FacingMode.unknown);
    expect(result.find((device) => device.deviceId === deviceWithoutId.deviceId)).toBeUndefined();
  });

  it('returns null inferred facing mode when platform is not mobile', async () => {
    expect.assertions(1);

    vi.mocked(isMobile).mockReturnValue(false);

    const result = await getMediaDevicesInfo();
    const videoInputDevices = result.filter((device) => device.kind === 'videoinput');

    expect(videoInputDevices.every((device) => device.inferredFacingMode === null)).toBe(true);
  });

  it('does not deadlock when skipStoreReady is set while isStoreReady is still pending', async () => {
    const metadata = mediaDevices$.getMetadata();

    // Firefox bootstrap is parked on the permission prompt: isStoreReady is still pending, and a
    // concurrent getUserMedia-driven sync already consumed the single-use first-query flag. The
    // bootstrap's own sync must skip readiness explicitly, or it awaits the promise it must resolve.
    metadata.isStoreReady = new Promise<void>(() => {}) as never;
    (
      metadata as unknown as { isFirstMediaDevicesInfoQuery: boolean }
    ).isFirstMediaDevicesInfoQuery = false;

    const outcome = await Promise.race([
      getMediaDevicesInfo({ skipStoreReady: true }).then(() => 'resolved'),
      new Promise((resolve) => {
        setTimeout(() => resolve('deadlock'), 150);
      }),
    ]);

    expect(outcome).toBe('resolved');
  });
});
