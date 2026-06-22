import { describe, it, expect } from 'vitest';
import { durationValue } from './';

const locale = { locales: 'en-US' };

describe('DurationValue', () => {
  it('formats millisecond and second thresholds', () => {
    expect(durationValue(999, locale).toString()).toBe('999 ms');
    expect(durationValue(1000, locale).toString()).toBe('1.0 s');
  });
});
