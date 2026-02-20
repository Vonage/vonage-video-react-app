import { describe, it, expect } from 'vitest';
import MediaDeviceInfoJSONSchema, { assertMediaDeviceInfo } from '.';

describe('MediaDeviceInfoJSONSchema', () => {
  const validDevice = {
    deviceId: 'device-123',
    kind: 'audioinput' as const,
    label: 'Built-in Microphone',
    groupId: 'group-1',
  };

  it('should validate a valid media device info object', () => {
    expect(MediaDeviceInfoJSONSchema.safeParse(validDevice).success).toBe(true);
  });

  it('should reject invalid device kind', () => {
    const invalidDevice = { ...validDevice, kind: 'invalidkind' };
    expect(MediaDeviceInfoJSONSchema.safeParse(invalidDevice).success).toBe(false);
  });

  it('should reject missing required fields', () => {
    const { deviceId: _, ...incomplete } = validDevice;
    expect(MediaDeviceInfoJSONSchema.safeParse(incomplete).success).toBe(false);
  });
});

describe('assertMediaDeviceInfo', () => {
  it('should not throw for valid media device info', () => {
    const validDevice = {
      deviceId: 'device-123',
      kind: 'videoinput' as const,
      label: 'Webcam',
      groupId: 'group-1',
    };
    expect(() => assertMediaDeviceInfo(validDevice)).not.toThrow();
  });

  it('should throw for invalid media device info', () => {
    expect(() => assertMediaDeviceInfo({ invalid: 'data' })).toThrow();
  });
});
