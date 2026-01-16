import { describe, it, expect } from 'vitest';
import isErrorLike from './';

describe('isErrorLike', () => {
  it('should return true for Error instances and error-like objects with message', () => {
    expect(isErrorLike(new Error('test'))).toBe(true);
    expect(isErrorLike({ message: 'error' })).toBe(true);
    expect(isErrorLike({ message: 'error', stack: 'trace' })).toBe(true);
  });

  it('should return false for non-error-like values', () => {
    expect(isErrorLike({})).toBe(false);
    expect(isErrorLike({ message: 123 })).toBe(false);
    expect(isErrorLike('error')).toBe(false);
    expect(isErrorLike(null)).toBe(false);
    expect(isErrorLike(undefined)).toBe(false);
  });
});
