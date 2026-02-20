import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { makeMediaDeviceInfos } from '@web-test/fixtures';
import mediaDevices$ from '../../devices$';
import useMediaDeviceInfo from './useMediaDeviceInfo';

const devices = makeMediaDeviceInfos();
const audioInputDevice = devices.find((device) => device.kind === 'audioinput')!;
const videoInputDevices = devices.filter((device) => device.kind === 'videoinput');
const secondVideoInputDevice = videoInputDevices[1];

describe('useMediaDeviceInfo', () => {
  beforeEach(() => {
    mediaDevices$.setState((state) => ({
      ...state,
      mediaDeviceInfo: devices,
      audioinput: audioInputDevice.deviceId,
      videoinput: videoInputDevices[0].deviceId,
      audiooutput: devices.find((device) => device.kind === 'audiooutput')!.deviceId,
    }));
  });

  it('should return the selected device for the given kind', () => {
    const { result } = renderHook(() => useMediaDeviceInfo('audioinput'));

    expect(result.current).toMatchObject({
      deviceId: audioInputDevice.deviceId,
      kind: audioInputDevice.kind,
      label: audioInputDevice.label,
    });
  });

  it('should return a specific device by kind and deviceId', () => {
    const { result } = renderHook(() =>
      useMediaDeviceInfo('videoinput', secondVideoInputDevice.deviceId)
    );

    expect(result.current).toMatchObject({
      deviceId: secondVideoInputDevice.deviceId,
      kind: secondVideoInputDevice.kind,
      label: secondVideoInputDevice.label,
    });
  });
});
