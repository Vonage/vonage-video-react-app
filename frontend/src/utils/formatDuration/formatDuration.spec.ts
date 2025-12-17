import { describe, it, expect } from 'vitest';
import formatDuration from './formatDuration';

describe('formatDuration', () => {
  it('should format seconds only', () => {
    expect(formatDuration(30)).toBe('0:30');
    expect(formatDuration(5)).toBe('0:05');
    expect(formatDuration(59)).toBe('0:59');
  });

  it('should format minutes and seconds', () => {
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(125)).toBe('2:05');
    expect(formatDuration(3599)).toBe('59:59');
  });

  it('should format hours, minutes and seconds', () => {
    expect(formatDuration(3600)).toBe('1:00:00');
    expect(formatDuration(3665)).toBe('1:01:05');
    expect(formatDuration(7325)).toBe('2:02:05');
    expect(formatDuration(36000)).toBe('10:00:00');
  });

  it('should handle zero', () => {
    expect(formatDuration(0)).toBe('--:--');
  });

  it('should handle undefined', () => {
    expect(formatDuration(undefined)).toBe('--:--');
  });

  it('should handle negative values', () => {
    expect(formatDuration(-10)).toBe('--:--');
  });

  it('should handle decimal values by flooring them', () => {
    expect(formatDuration(65.7)).toBe('1:05');
    expect(formatDuration(3665.9)).toBe('1:01:05');
  });
});
