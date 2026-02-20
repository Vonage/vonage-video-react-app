import { describe, it, expect } from 'vitest';
import isNotNil from './';

describe('isNotNil', () => {
  it('should return false for nil values and true for non-nil values', () => {
    expect(isNotNil(null)).toBe(false);
    expect(isNotNil(undefined)).toBe(false);
    expect(isNotNil(0)).toBe(true);
    expect(isNotNil('')).toBe(true);
    expect(isNotNil(false)).toBe(true);
  });
});
