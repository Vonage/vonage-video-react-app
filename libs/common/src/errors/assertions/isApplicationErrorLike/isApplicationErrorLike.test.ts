import { describe, it, expect } from 'vitest';
import isApplicationErrorLike from './';

describe('isApplicationErrorLike', () => {
  it('should return true for objects with message property', () => {
    expect(isApplicationErrorLike({ message: 'error message' })).toBe(true);
  });

  it('should return true for Error instances', () => {
    expect(isApplicationErrorLike(new Error('test error'))).toBe(true);
    expect(isApplicationErrorLike(new TypeError('type error'))).toBe(true);
  });

  it('should return true for objects with message and other ApplicationError properties', () => {
    const errorLike = {
      message: 'Test error',
      severity: 'error' as const,
      statusCode: 500,
      fallbackConfig: {
        fallbackMessage: 'User message',
        statusCode: 500,
      },
    };
    expect(isApplicationErrorLike(errorLike)).toBe(true);
  });

  it('should return true for objects with just message and stack', () => {
    const errorLike = {
      message: 'Test error',
      stack: 'Error: Test error\n    at somewhere',
    };
    expect(isApplicationErrorLike(errorLike)).toBe(true);
  });

  it('should return false for objects without message', () => {
    expect(isApplicationErrorLike({})).toBe(false);
    expect(isApplicationErrorLike({ error: 'test' })).toBe(false);
    expect(isApplicationErrorLike({ statusCode: 500 })).toBe(false);
  });

  it('should return false for primitives', () => {
    expect(isApplicationErrorLike('error')).toBe(false);
    expect(isApplicationErrorLike(123)).toBe(false);
    expect(isApplicationErrorLike(true)).toBe(false);
    expect(isApplicationErrorLike(null)).toBe(false);
    expect(isApplicationErrorLike(undefined)).toBe(false);
  });

  it('should return false for arrays', () => {
    expect(isApplicationErrorLike([])).toBe(false);
    expect(isApplicationErrorLike([{ message: 'error' }])).toBe(false);
  });

  it('should return false for objects with non-string message', () => {
    expect(isApplicationErrorLike({ message: 123 })).toBe(false);
    expect(isApplicationErrorLike({ message: null })).toBe(false);
    expect(isApplicationErrorLike({ message: { text: 'error' } })).toBe(false);
  });

  it('should validate partial ApplicationErrorState objects', () => {
    const partial = {
      message: 'Partial error',
      severity: 'validation' as const,
    };
    expect(isApplicationErrorLike(partial)).toBe(true);
  });
});
