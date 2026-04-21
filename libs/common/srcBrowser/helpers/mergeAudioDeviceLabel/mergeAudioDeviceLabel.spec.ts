import { describe, it, expect } from 'vitest';
import type { MediaDeviceInfoJSON } from '@web/types';
import mergeAudioDeviceLabel from './mergeAudioDeviceLabel';

const SYSTEM_DEFAULT_LABEL = 'System Default';

const makeDevice = (overrides: Partial<MediaDeviceInfoJSON>): MediaDeviceInfoJSON => ({
  deviceId: 'some-id',
  kind: 'audiooutput',
  label: 'Some Speaker',
  groupId: 'group-1',
  ...overrides,
});

describe('mergeAudioDeviceLabel', () => {
  it('returns devices unchanged when no default device present', () => {
    const devices = [
      makeDevice({ deviceId: 'speaker-1', label: 'MacBook Pro Speakers', groupId: 'group-1' }),
      makeDevice({ deviceId: 'speaker-2', label: 'Bluetooth Headset', groupId: 'group-2' }),
    ];

    const result = mergeAudioDeviceLabel(devices, SYSTEM_DEFAULT_LABEL);

    expect(result.devices).toBe(devices);
    expect(result.systemDefaultId).toBeNull();
  });

  it('returns devices unchanged when default device has empty groupId (pre-permission state)', () => {
    const devices = [
      makeDevice({ deviceId: 'default', label: '', groupId: '' }),
      makeDevice({ deviceId: 'speaker-1', label: '', groupId: '' }),
    ];

    const result = mergeAudioDeviceLabel(devices, SYSTEM_DEFAULT_LABEL);

    expect(result.devices).toBe(devices);
    expect(result.systemDefaultId).toBeNull();
  });

  it('merges default device into matching physical device by groupId', () => {
    const devices = [
      makeDevice({ deviceId: 'default', label: 'Default', groupId: 'group-1' }),
      makeDevice({ deviceId: 'speaker-1', label: 'MacBook Pro Speakers', groupId: 'group-1' }),
      makeDevice({ deviceId: 'speaker-2', label: 'Bluetooth Headset', groupId: 'group-2' }),
    ];

    const result = mergeAudioDeviceLabel(devices, SYSTEM_DEFAULT_LABEL);

    expect(result.devices).toHaveLength(2);
    expect(result.devices.find((d) => d.deviceId === 'default')).toBeUndefined();
    expect(result.devices.find((d) => d.deviceId === 'speaker-1')?.label).toBe(
      'MacBook Pro Speakers - System Default'
    );
    expect(result.devices.find((d) => d.deviceId === 'speaker-2')?.label).toBe('Bluetooth Headset');
    expect(result.systemDefaultId).toBe('speaker-1');
  });

  it('removes default device without annotating when no physical device has matching groupId', () => {
    const devices = [
      makeDevice({ deviceId: 'default', label: 'Default', groupId: 'group-99' }),
      makeDevice({ deviceId: 'speaker-1', label: 'MacBook Pro Speakers', groupId: 'group-1' }),
    ];

    const result = mergeAudioDeviceLabel(devices, SYSTEM_DEFAULT_LABEL);

    expect(result.devices).toHaveLength(1);
    expect(result.devices[0].label).toBe('MacBook Pro Speakers');
    expect(result.systemDefaultId).toBeNull();
  });

  it('preserves all other device fields on the annotated device', () => {
    const devices = [
      makeDevice({ deviceId: 'default', groupId: 'group-1' }),
      makeDevice({ deviceId: 'speaker-1', label: 'Built-in Speakers', groupId: 'group-1' }),
    ];

    const result = mergeAudioDeviceLabel(devices, SYSTEM_DEFAULT_LABEL);
    const annotated = result.devices.find((d) => d.deviceId === 'speaker-1');

    expect(annotated?.deviceId).toBe('speaker-1');
    expect(annotated?.kind).toBe('audiooutput');
    expect(annotated?.groupId).toBe('group-1');
    expect(annotated?.label).toBe('Built-in Speakers - System Default');
  });

  it('uses the provided systemDefaultLabel in the annotation', () => {
    const devices = [
      makeDevice({ deviceId: 'default', groupId: 'group-1' }),
      makeDevice({ deviceId: 'speaker-1', label: 'Built-in', groupId: 'group-1' }),
    ];

    const result = mergeAudioDeviceLabel(devices, 'Custom Default Label');

    expect(result.devices[0].label).toBe('Built-in - Custom Default Label');
  });
});
