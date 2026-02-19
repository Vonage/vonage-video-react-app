import { describe, it, expect } from 'vitest';
import DeviceKindSchema, { assertDeviceKind } from '.';

describe('DeviceKindSchema', () => {
  it('should validate valid device kinds', () => {
    expect(DeviceKindSchema.safeParse('audioinput').success).toBe(true);
    expect(DeviceKindSchema.safeParse('videoinput').success).toBe(true);
    expect(DeviceKindSchema.safeParse('audiooutput').success).toBe(true);
  });

  it('should reject invalid device kinds', () => {
    expect(DeviceKindSchema.safeParse('invalid').success).toBe(false);
    expect(DeviceKindSchema.safeParse('audioInput').success).toBe(false);
    expect(DeviceKindSchema.safeParse('').success).toBe(false);
  });
});

describe('assertDeviceKind', () => {
  it('should not throw for valid device kind', () => {
    expect(() => assertDeviceKind('audioinput')).not.toThrow();
  });

  it('should throw for invalid device kind', () => {
    expect(() => assertDeviceKind('invalid')).toThrow();
  });
});
