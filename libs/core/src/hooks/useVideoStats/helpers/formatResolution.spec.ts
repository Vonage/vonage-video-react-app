import { describe, expect, it } from 'vitest';
import formatResolution from './formatResolution';

describe('formatResolution', () => {
  it('returns null when height is not available', () => {
    expect(formatResolution(null)).toBeNull();
  });

  it('formats common resolutions', () => {
    expect(formatResolution(1080)).toBe('1080p');
    expect(formatResolution(720)).toBe('720p');
    expect(formatResolution(480)).toBe('480p');
  });

  it('handles atypical heights', () => {
    expect(formatResolution(0)).toBe('0p');
    expect(formatResolution(1234)).toBe('1234p');
  });
});
