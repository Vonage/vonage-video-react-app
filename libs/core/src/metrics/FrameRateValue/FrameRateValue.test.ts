import { describe, it, expect } from 'vitest';
import { frameRateValue } from './';

const locale = { locales: 'en-US' };

describe('FrameRateValue', () => {
  it('returns em-dash for zero or negative frame rate', () => {
    expect(frameRateValue(0, locale).toString()).toBe('–');
    expect(frameRateValue(-1, locale).toString()).toBe('–');
  });

  it('rounds and appends fps', () => {
    expect(frameRateValue(24.4, locale).toString()).toBe('24 fps');
    expect(frameRateValue(29.9, locale).toString()).toBe('30 fps');
  });
});
