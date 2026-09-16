import { describe, it, expect } from 'vitest';
import ArchiveModeSchema from './ArchiveMode.schema';

describe('ArchiveModeSchema', () => {
  it('should accept valid archive modes', () => {
    expect(ArchiveModeSchema.safeParse('manual').success).toBe(true);
    expect(ArchiveModeSchema.safeParse('always').success).toBe(true);
  });

  it('should reject an invalid archive mode', () => {
    expect(ArchiveModeSchema.safeParse('invalid').success).toBe(false);
  });
});
