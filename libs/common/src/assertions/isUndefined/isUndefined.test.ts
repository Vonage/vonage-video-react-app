import { describe, it, expect } from 'vitest';
import isUndefined from './';

describe('isUndefined', () => {
  it('should return true only for undefined', () => {
    expect(isUndefined(undefined)).toBe(true);
    expect(isUndefined(null)).toBe(false);
    expect(isUndefined(0)).toBe(false);
    expect(isUndefined('')).toBe(false);
  });
});
