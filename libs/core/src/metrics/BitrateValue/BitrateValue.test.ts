import { describe, it, expect } from 'vitest';
import { bitrateValue } from './';

const locale = { locales: 'en-US' };

describe('BitrateValue', () => {
  it('returns em-dash for zero or negative bitrate', () => {
    expect(bitrateValue(0, locale).toString()).toBe('–');
    expect(bitrateValue(-1, locale).toString()).toBe('–');
  });

  it('formats bitrate thresholds', () => {
    expect(bitrateValue(999, locale).toString()).toBe('999 bps');
    expect(bitrateValue(1000, locale).toString()).toBe('1.0 kbps');
    expect(bitrateValue(1_000_000, locale).toString()).toBe('1.00 Mbps');
  });
});
