import { describe, it, expect } from 'vitest';
import isValidSessionId from './isValidSessionId';

describe('isValidSessionId', () => {
  it('should return true for valid session IDs', () => {
    const validSessionId = '1_MX4xMjM0NTY3OH4-VGh1IEZlYiAyNyAwODozMjozNCBQU1QgMjAyMH4wLjI0NDYxMjE';

    expect(isValidSessionId(validSessionId)).toBe(true);
  });

  it('should return false for invalid session ID format', () => {
    expect(isValidSessionId('invalid-session-id')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isValidSessionId('')).toBe(false);
  });

  it('should return false for non-string values', () => {
    expect(isValidSessionId(null)).toBe(false);
    expect(isValidSessionId(undefined)).toBe(false);
    expect(isValidSessionId(123)).toBe(false);
    expect(isValidSessionId({})).toBe(false);
    expect(isValidSessionId([])).toBe(false);
  });

  it('should return false for session ID without proper structure', () => {
    expect(isValidSessionId('1_MX4')).toBe(false);
    expect(isValidSessionId('invalid_format_here')).toBe(false);
  });
});
