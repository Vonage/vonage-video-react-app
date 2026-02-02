import { describe, it, expect } from 'vitest';
import isAudioInputDevice from './isAudioInputDevice';

describe('isAudioInputDevice', () => {
  it('when given an audioInput device, returns true', () => {
    const audioInputDevice: MediaDeviceInfo = {
      kind: 'audioinput',
      deviceId: 'deviceId',
      label: 'deviceLabel',
      groupId: 'groupId',
      toJSON: () => ({}),
    };

    const result = isAudioInputDevice(audioInputDevice);

    expect(result).toBe(true);
  });

  it('when given a videoInputDevice, returns false', () => {
    const videoInputDevice: MediaDeviceInfo = {
      kind: 'videoinput',
      deviceId: 'deviceId',
      label: 'deviceLabel',
      groupId: 'groupId',
      toJSON: () => ({}),
    };

    const result = isAudioInputDevice(videoInputDevice);
    expect(result).toBe(false);
  });
});
