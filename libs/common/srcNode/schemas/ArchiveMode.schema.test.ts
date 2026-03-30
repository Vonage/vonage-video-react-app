import { describe, it, expect } from 'vitest';
import { ArchiveMode } from '@vonage/video';
import ArchiveModeSchema from './ArchiveMode.schema';

describe('ArchiveModeSchema', () => {
  it('should validate MANUAL archive mode', () => {
    const result = ArchiveModeSchema.safeParse(ArchiveMode.MANUAL);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(ArchiveMode.MANUAL);
    }
  });

  it('should validate ALWAYS archive mode', () => {
    const result = ArchiveModeSchema.safeParse(ArchiveMode.ALWAYS);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(ArchiveMode.ALWAYS);
    }
  });

  it('should reject invalid archive mode', () => {
    const result = ArchiveModeSchema.safeParse('invalid-mode');
    expect(result.success).toBe(false);
  });

  it('should reject non-string values', () => {
    expect(ArchiveModeSchema.safeParse(null).success).toBe(false);
    expect(ArchiveModeSchema.safeParse(undefined).success).toBe(false);
    expect(ArchiveModeSchema.safeParse(123).success).toBe(false);
    expect(ArchiveModeSchema.safeParse({}).success).toBe(false);
  });
});
