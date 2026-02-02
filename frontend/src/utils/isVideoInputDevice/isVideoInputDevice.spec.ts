import { describe, it, expect } from 'vitest';
import isVideoInputDevice from './isVideoInputDevice';

describe('isVideoInputDevice', () => {
  it('when given a videoInputDevice, returns true', () => {
    const videoInputDevice: MediaDeviceInfo = {
      kind: 'videoinput',
      deviceId: 'deviceId',
      label: 'deviceLabel',
      groupId: 'groupId',
      toJSON: () => ({}),
    };

    const result = isVideoInputDevice(videoInputDevice);
    expect(result).toBe(true);
  });

  it('when given an audioInput device, returns false', () => {
    const audioInputDevice: MediaDeviceInfo = {
      kind: 'audioinput',
      deviceId: 'deviceId',
      label: 'deviceLabel',
      groupId: 'groupId',
      toJSON: () => ({}),
    };

    const result = isVideoInputDevice(audioInputDevice);

    expect(result).toBe(false);
  });
});
