import { describe, it, expect } from 'vitest';
import removeUndefinedProps from './';

describe('removeUndefinedProps', () => {
  it('should remove undefined properties', () => {
    const input = { a: 1, b: undefined, c: 'test' };
    const result = removeUndefinedProps(input);
    expect(result).toEqual({ a: 1, c: 'test' });
  });

  it('should keep null values', () => {
    const input = { a: null, b: undefined };
    const result = removeUndefinedProps(input);
    expect(result).toEqual({ a: null });
  });

  it('should return empty object if all values are undefined', () => {
    const input = { a: undefined, b: undefined };
    const result = removeUndefinedProps(input);
    expect(result).toEqual({});
  });
});
