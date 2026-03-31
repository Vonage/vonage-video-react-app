import { describe, it, expect } from 'vitest';
import { MediaMode } from '@vonage/video';
import MediaModeSchema from './MediaMode.schema';

describe('MediaModeSchema', () => {
  it('should validate ROUTED media mode', () => {
    const result = MediaModeSchema.safeParse(MediaMode.ROUTED);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(MediaMode.ROUTED);
    }
  });

  it('should validate RELAYED media mode', () => {
    const result = MediaModeSchema.safeParse(MediaMode.RELAYED);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(MediaMode.RELAYED);
    }
  });

  it('should reject invalid media mode', () => {
    const result = MediaModeSchema.safeParse('invalid-mode');
    expect(result.success).toBe(false);
  });

  it('should reject non-string values', () => {
    expect(MediaModeSchema.safeParse(null).success).toBe(false);
    expect(MediaModeSchema.safeParse(undefined).success).toBe(false);
    expect(MediaModeSchema.safeParse(123).success).toBe(false);
    expect(MediaModeSchema.safeParse({}).success).toBe(false);
  });
});
