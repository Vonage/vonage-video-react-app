import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FacingMode } from '@common/types';
import { isMobile } from '@web/platform';
import {
  makeMediaDeviceInfos,
  frontCameraId,
  rearCameraId,
  setupWindowNavigatorMock,
} from '@web-test/fixtures';
import mediaDevices$ from '../../devices$';
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
});
