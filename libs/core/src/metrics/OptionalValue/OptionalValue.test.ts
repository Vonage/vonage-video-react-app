import { describe, it, expect } from 'vitest';
import { optionalValue } from './';
import { BytesValue } from '../BytesValue/BytesValue';

const args = { locales: 'en-US' };

describe('optionalValue', () => {
  it('returns the metric instance when value is non-null', () => {
    const result = optionalValue(BytesValue, 1024, args);

    expect(result.toString()).toBe('1.0 KB');
    expect(result.metric).toBeInstanceOf(BytesValue);
  });

  it('returns an empty string by default when value is null', () => {
    expect(optionalValue(BytesValue, null, args).toString()).toBe('');
  });

  it('returns the custom fallback when value is null', () => {
    expect(optionalValue(BytesValue, null, { fallback: '–' }).toString()).toBe('–');
  });
});
