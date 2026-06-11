import { describe, it, expect } from 'vitest';
import { resolutionValue } from './';

describe('ResolutionValue', () => {
  it('returns em-dash for null or incomplete resolution', () => {
    expect(resolutionValue(null).toString()).toBe('–');
    expect(resolutionValue({ width: null, height: 720 }).toString()).toBe('–');
    expect(resolutionValue({ width: 1280, height: null }).toString()).toBe('–');
  });

  it('returns em-dash for zero dimensions', () => {
    expect(resolutionValue({ width: 0, height: 720 }).toString()).toBe('–');
  });

  it('formats valid resolution without thousands separators', () => {
    expect(resolutionValue({ width: 1280, height: 720 }).toString()).toBe('1280x720');
  });

  it('accepts string dimensions', () => {
    expect(resolutionValue({ width: 1920, height: 1080 }).toString()).toBe('1920x1080');
  });
});
