import { describe, it, expect } from 'vitest';
import { VonageDeviceKindSchema } from '.';

describe('VonageDeviceKindSchema', () => {
  it('should validate audioInput', () => {
    expect(VonageDeviceKindSchema.safeParse('audioInput').success).toBe(true);
  });

  it('should validate videoInput', () => {
    expect(VonageDeviceKindSchema.safeParse('videoInput').success).toBe(true);
  });

  it('should reject audioOutput (not a valid vonage device kind)', () => {
    expect(VonageDeviceKindSchema.safeParse('audioOutput').success).toBe(false);
  });

  it('should reject browser-style device kinds', () => {
    expect(VonageDeviceKindSchema.safeParse('audioinput').success).toBe(false);
    expect(VonageDeviceKindSchema.safeParse('videoinput').success).toBe(false);
  });
});
