import { describe, it, expect } from 'vitest';
import { integerValue } from './';

describe('IntegerValue', () => {
  it('formats a whole number', () => {
    expect(integerValue(1280, { locales: 'en-US' }).toString()).toBe('1,280');
  });

  it('truncates fractional digits', () => {
    expect(integerValue(99.9, { locales: 'en-US' }).toString()).toBe('100');
  });
});
