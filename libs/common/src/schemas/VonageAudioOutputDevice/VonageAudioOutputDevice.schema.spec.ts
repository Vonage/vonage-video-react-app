import { describe, it, expect } from 'vitest';
import { VonageAudioOutputDeviceSchema, assertVonageAudioOutputDevice } from '.';

describe('VonageAudioOutputDeviceSchema', () => {
  it('should validate a valid audio output device', () => {
    const validDevice = {
      deviceId: 'speaker-123',
      label: 'Built-in Speakers',
    };
    expect(VonageAudioOutputDeviceSchema.safeParse(validDevice).success).toBe(true);
  });

  it('should reject missing deviceId', () => {
    const invalidDevice = { label: 'Speakers' };
    expect(VonageAudioOutputDeviceSchema.safeParse(invalidDevice).success).toBe(false);
  });

  it('should reject missing label', () => {
    const invalidDevice = { deviceId: 'speaker-123' };
    expect(VonageAudioOutputDeviceSchema.safeParse(invalidDevice).success).toBe(false);
  });
});

describe('assertVonageAudioOutputDevice', () => {
  it('should not throw for valid audio output device', () => {
    const validDevice = {
      deviceId: 'speaker-123',
      label: 'Headphones',
    };
    expect(() => assertVonageAudioOutputDevice(validDevice)).not.toThrow();
  });

  it('should throw for invalid audio output device', () => {
    expect(() => assertVonageAudioOutputDevice({ invalid: 'data' })).toThrow();
  });
});
