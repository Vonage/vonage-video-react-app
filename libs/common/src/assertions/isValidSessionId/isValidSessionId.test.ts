import { describe, it, expect } from 'vitest';
import isValidSessionId from '.';

describe('isValidSessionId', () => {
  it('should return true for a valid session ID', () => {
    expect(
      isValidSessionId('1_MX4xMjM0NTY3OH4-VGh1IEZlYiAyNyAwODozMjozNCBQU1QgMjAyMH4wLjI0NDYxMjE')
    ).toBe(true);
  });

  it('should return false for invalid values', () => {
    expect(isValidSessionId('invalid-session-id')).toBe(false);
    expect(isValidSessionId(null)).toBe(false);
    expect(isValidSessionId(undefined)).toBe(false);
  });
});
