import { describe, it, expect } from 'vitest';
import isRecord from './';

describe('isRecord', () => {
  it('should return true for objects', () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord({ key: 'value' })).toBe(true);
  });

  it('should return false for null and undefined', () => {
    expect(isRecord(null)).toBe(false);
    expect(isRecord(undefined)).toBe(false);
  });

  it('should return false for primitives', () => {
    expect(isRecord(123)).toBe(false);
    expect(isRecord('string')).toBe(false);
    expect(isRecord(true)).toBe(false);
  });
});
