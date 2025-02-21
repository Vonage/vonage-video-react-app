import { describe, expect, it } from 'vitest';
import truncateString from './truncateString';

describe('truncateString', () => {
  it('truncates string over maxLength', () => {
    expect(truncateString('str', 0)).toBe('...');
    expect(truncateString('str', 1)).toBe('s...');
    expect(truncateString('long string', 10)).toBe('long st...');
  });

  it('does not truncate string under maxLength', () => {
    expect(truncateString('', 0)).toBe('');
    expect(truncateString('str', 3)).toBe('str');
    expect(truncateString('long string', 14)).toBe('long string');
  });
});
