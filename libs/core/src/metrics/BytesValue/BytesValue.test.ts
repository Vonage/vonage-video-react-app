import { describe, it, expect } from 'vitest';
import { bytesValue } from './';

const locale = { locales: 'en-US' };

describe('BytesValue', () => {
  it('formats bytes and unit thresholds', () => {
    expect(bytesValue(1023, locale).toString()).toBe('1,023 B');
    expect(bytesValue(1024, locale).toString()).toBe('1.0 KB');
    expect(bytesValue(1024 * 1024, locale).toString()).toBe('1.0 MB');
    expect(bytesValue(1024 * 1024 * 1024, locale).toString()).toBe('1.0 GB');
  });
});
