import { describe, it, expect } from 'vitest';
import renameDefaultAudioOutputDevice from './renameDefaultAudioOutputDevice';

describe('renameDefaultAudioOutputDevice', () => {
  it('should rename any audio output devices that are default', () => {
    const defaultAudioDevice = {
      deviceId: 'default',
      label: 'some-device-label',
    } as MediaDeviceInfo;

    const result = renameDefaultAudioOutputDevice(defaultAudioDevice);

    expect(result).toEqual({
      ...defaultAudioDevice,
      label: 'System Default',
    });
  });

  it('should ignore any audio output devices not marked as default', () => {
    const regularAudioDevice = {
      deviceId: 'some-device-id',
      label: 'some-device-label',
    } as MediaDeviceInfo;

    const result = renameDefaultAudioOutputDevice(regularAudioDevice);

    expect(result).toEqual(regularAudioDevice);
  });
});
