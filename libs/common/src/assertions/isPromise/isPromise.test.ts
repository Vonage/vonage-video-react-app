import { describe, it, expect } from 'vitest';
import isPromise from './';

describe('isPromise', () => {
  it('should return true for promises and thenables', () => {
    expect(isPromise(Promise.resolve(42))).toBe(true);
    expect(isPromise({ then: () => {} })).toBe(true);
  });

  it('should return false for non-promises', () => {
    expect(isPromise(null)).toBe(false);
    expect(isPromise(undefined)).toBe(false);
    expect(isPromise(42)).toBe(false);
    expect(isPromise({})).toBe(false);
    expect(isPromise({ then: 'not a function' })).toBe(false);
  });
});
