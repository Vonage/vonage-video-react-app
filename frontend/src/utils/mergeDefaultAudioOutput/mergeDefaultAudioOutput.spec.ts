import { describe, it, expect } from 'vitest';
import type { MediaDeviceInfoJSON } from '@web/types';
import mergeDefaultAudioOutput from '.';

const makeDevice = (deviceId: string, label: string): MediaDeviceInfoJSON =>
  ({ deviceId, label, kind: 'audiooutput', groupId: '' }) as MediaDeviceInfoJSON;

const SYSTEM_DEFAULT_LABEL = 'System Default';

describe('mergeDefaultAudioOutput', () => {
  it('returns devices unchanged when no "default" device is present', () => {
    const devices = [makeDevice('abc', 'MacBook Pro Speakers'), makeDevice('def', 'USB Headset')];

    const { devices: result, systemDefaultDeviceId } = mergeDefaultAudioOutput({
      devices,
      systemDefaultLabel: SYSTEM_DEFAULT_LABEL,
    });

    expect(result).toEqual(devices);
    expect(systemDefaultDeviceId).toBeNull();
  });

  it('removes the "default" device and tags the matching real device', () => {
    const devices = [
      makeDevice('default', 'Default - MacBook Pro Speakers'),
      makeDevice('abc', 'MacBook Pro Speakers'),
      makeDevice('def', 'USB Headset'),
    ];

    const { devices: result, systemDefaultDeviceId } = mergeDefaultAudioOutput({
      devices,
      systemDefaultLabel: SYSTEM_DEFAULT_LABEL,
    });

    expect(result).toHaveLength(2);
    expect(result.find((d) => d.deviceId === 'default')).toBeUndefined();
    expect(result.find((d) => d.deviceId === 'abc')?.label).toBe(
      'MacBook Pro Speakers - System Default'
    );
    expect(result.find((d) => d.deviceId === 'def')?.label).toBe('USB Headset');
    expect(systemDefaultDeviceId).toBe('abc');
  });

  it('removes the "default" device even when no real device label matches', () => {
    const devices = [
      makeDevice('default', 'Default - Some Unknown Speaker'),
      makeDevice('abc', 'MacBook Pro Speakers'),
    ];

    const { devices: result, systemDefaultDeviceId } = mergeDefaultAudioOutput({
      devices,
      systemDefaultLabel: SYSTEM_DEFAULT_LABEL,
    });

    expect(result).toHaveLength(1);
    expect(result[0].deviceId).toBe('abc');
    expect(result[0].label).toBe('MacBook Pro Speakers');
    expect(systemDefaultDeviceId).toBeNull();
  });

  it('removes the "default" device when its label does not follow the "Default - X" format', () => {
    const devices = [makeDevice('default', 'Default'), makeDevice('abc', 'MacBook Pro Speakers')];

    const { devices: result, systemDefaultDeviceId } = mergeDefaultAudioOutput({
      devices,
      systemDefaultLabel: SYSTEM_DEFAULT_LABEL,
    });

    expect(result).toHaveLength(1);
    expect(result[0].deviceId).toBe('abc');
    expect(systemDefaultDeviceId).toBeNull();
  });

  it('preserves the "default" device renamed to the translated label when it is the only device', () => {
    const devices = [makeDevice('default', 'Default - MacBook Pro Speakers')];

    const { devices: result, systemDefaultDeviceId } = mergeDefaultAudioOutput({
      devices,
      systemDefaultLabel: SYSTEM_DEFAULT_LABEL,
    });

    expect(result).toHaveLength(1);
    expect(result[0].deviceId).toBe('default');
    expect(result[0].label).toBe(SYSTEM_DEFAULT_LABEL);
    expect(systemDefaultDeviceId).toBeNull();
  });

  it('uses the provided systemDefaultLabel in the tagged device label', () => {
    const devices = [
      makeDevice('default', 'Default - MacBook Pro Speakers'),
      makeDevice('abc', 'MacBook Pro Speakers'),
    ];

    const { devices: result } = mergeDefaultAudioOutput({
      devices,
      systemDefaultLabel: 'Système par défaut',
    });

    expect(result.find((d) => d.deviceId === 'abc')?.label).toBe(
      'MacBook Pro Speakers - Système par défaut'
    );
  });

  it('handles "Default - " prefix matching case-insensitively', () => {
    const devices = [
      makeDevice('default', 'DEFAULT - MacBook Pro Speakers'),
      makeDevice('abc', 'MacBook Pro Speakers'),
    ];

    const { devices: result, systemDefaultDeviceId } = mergeDefaultAudioOutput({
      devices,
      systemDefaultLabel: SYSTEM_DEFAULT_LABEL,
    });

    expect(result.find((d) => d.deviceId === 'abc')?.label).toBe(
      'MacBook Pro Speakers - System Default'
    );
    expect(systemDefaultDeviceId).toBe('abc');
  });

  it('does not tag unrelated devices when no label match', () => {
    const devices = [
      makeDevice('default', 'Default - MacBook Pro Speakers'),
      makeDevice('abc', 'USB Headset'),
      makeDevice('def', 'Bluetooth Speaker'),
    ];

    const { devices: result, systemDefaultDeviceId } = mergeDefaultAudioOutput({
      devices,
      systemDefaultLabel: SYSTEM_DEFAULT_LABEL,
    });

    expect(result.every((d) => !d.label.includes('System Default'))).toBe(true);
    expect(systemDefaultDeviceId).toBeNull();
  });
});
