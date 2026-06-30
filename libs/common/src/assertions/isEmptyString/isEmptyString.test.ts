import { describe, it, expect } from 'vitest';
import isEmptyString from '.';

describe('isEmptyString', () => {
  it('should evaluate if a string is empty', () => {
    expect(isEmptyString('')).toBe(true);
    expect(isEmptyString('hello')).toBe(false);
  });
});
