import { describe, it, expect } from 'vitest';
import isObject from './';

describe('isObject', () => {
  it('should return true for objects and arrays', () => {
    expect(isObject({})).toBe(true);
    expect(isObject([])).toBe(true);
    expect(isObject(new Date())).toBe(true);
  });

  it('should return false for null and primitives', () => {
    expect(isObject(null)).toBe(false);
    expect(isObject(undefined)).toBe(false);
    expect(isObject('string')).toBe(false);
    expect(isObject(123)).toBe(false);
    expect(isObject(() => {})).toBe(false);
  });
});
