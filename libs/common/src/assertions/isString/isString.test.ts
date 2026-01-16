import { describe, it, expect } from 'vitest';
import isString from './';

describe('isString', () => {
  it('should return true for strings', () => {
    expect(isString('')).toBe(true);
    expect(isString('hello')).toBe(true);
  });

  it('should return false for non-strings', () => {
    expect(isString(123)).toBe(false);
    expect(isString(null)).toBe(false);
    expect(isString(undefined)).toBe(false);
    expect(isString({})).toBe(false);
    expect(isString([])).toBe(false);
  });
});
