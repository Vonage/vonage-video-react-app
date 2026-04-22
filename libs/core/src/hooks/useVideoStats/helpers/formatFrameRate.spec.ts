import { describe, expect, it } from 'vitest';
import formatFrameRate from './formatFrameRate';

describe('formatFrameRate', () => {
  it('returns null when frame rate is not available', () => {
    expect(formatFrameRate(null)).toBeNull();
  });

  it('formats integer frame rates', () => {
    expect(formatFrameRate(60)).toBe('60fps');
    expect(formatFrameRate(0)).toBe('0fps');
  });

  it('rounds fractional frame rates to the nearest integer', () => {
    expect(formatFrameRate(29.4)).toBe('29fps');
    expect(formatFrameRate(29.5)).toBe('30fps');
  });
});
