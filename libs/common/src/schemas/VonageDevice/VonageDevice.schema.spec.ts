import { describe, it, expect } from 'vitest';
import { VonageDeviceSchema } from '.';

describe('VonageDeviceSchema', () => {
  it('should validate a valid vonage device', () => {
    const validDevice = {
      deviceId: 'device-123',
      label: 'Webcam',
      kind: 'videoInput',
    };
    expect(VonageDeviceSchema.safeParse(validDevice).success).toBe(true);
  });

  it('should validate audioInput kind', () => {
    const validDevice = {
      deviceId: 'mic-123',
      label: 'Microphone',
      kind: 'audioInput',
    };
    expect(VonageDeviceSchema.safeParse(validDevice).success).toBe(true);
  });

  it('should reject invalid kind', () => {
    const invalidDevice = {
      deviceId: 'device-123',
      label: 'Device',
      kind: 'audioOutput',
    };
    expect(VonageDeviceSchema.safeParse(invalidDevice).success).toBe(false);
  });

  it('should reject missing required fields', () => {
    const invalidDevice = { label: 'Device' };
    expect(VonageDeviceSchema.safeParse(invalidDevice).success).toBe(false);
  });
});
