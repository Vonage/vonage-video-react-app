import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { mediaDevices$ } from '@core/stores';
import {
  makeMediaDeviceInfos,
  makeMediaStreamMock,
  setupWindowNavigatorMock,
  frontCameraId,
  rearCameraId,
} from '@web-test/fixtures';
import useSwitchCameraFacingModeHandler from './useSwitchCameraFacingModeHandler';

const devices = makeMediaDeviceInfos();

const getUserMedia = vi.fn(() =>
  Promise.resolve(
    makeMediaStreamMock({
      getVideoTracks: [
        {
          getSettings: () => ({ deviceId: rearCameraId }),
        } as unknown as MediaStreamTrack,
      ],
      getTracks: [{ stop: vi.fn() } as unknown as MediaStreamTrack],
    })
  )
);

describe('useSwitchCameraFacingModeHandler', () => {
  beforeEach(() => {
    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        enumerateDevices: Promise.resolve(devices),
        getUserMedia,
      },
    });

    mediaDevices$.reset();
    mediaDevices$.setState((state) => ({
      ...state,
      videoinput: frontCameraId, // start with front camera selected
    }));
  });

  it('switches camera to the target facing mode and updates selected videoinput', async () => {
    expect.assertions(2);

    const { result } = renderHook(() => useSwitchCameraFacingModeHandler());

    expect(mediaDevices$.getState().videoinput).toBe(frontCameraId);

    await act(async () => {
      await result.current.switchCameraFacingModeHandler();
    });

    expect(mediaDevices$.getState().videoinput).toBe(rearCameraId);
  });

  it('keeps current selection when target facing mode is unavailable', async () => {
    expect.assertions(2);

    getUserMedia.mockRejectedValueOnce(new Error('OverconstrainedError'));

    const { result } = renderHook(() => useSwitchCameraFacingModeHandler());

    expect(mediaDevices$.getState().videoinput).toBe(frontCameraId);

    await act(async () => {
      await result.current.switchCameraFacingModeHandler();
    });

    expect(mediaDevices$.getState().videoinput).toBe(frontCameraId);
  });
});
