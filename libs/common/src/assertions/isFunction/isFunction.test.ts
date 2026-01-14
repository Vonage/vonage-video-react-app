import { describe, it, expect } from 'vitest';
import isFunction from './';

describe('isFunction', () => {
  it('should return true for functions', () => {
    expect(isFunction(() => {})).toBe(true);
    expect(isFunction(function () {})).toBe(true);
    expect(isFunction(async () => {})).toBe(true);
  });

  it('should return false for non-functions', () => {
    expect(isFunction({})).toBe(false);
    expect(isFunction('string')).toBe(false);
    expect(isFunction(123)).toBe(false);
    expect(isFunction(null)).toBe(false);
    expect(isFunction(undefined)).toBe(false);
  });
});
