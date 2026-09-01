import { describe, expect, it } from '@jest/globals';
import redactSensitiveKeys from '../helpers/redactSensitiveKeys';

describe('redactSensitiveKeys', () => {
  it('redacts values whose key matches a sensitive pattern, preserving the key name', () => {
    expect(redactSensitiveKeys({ token: 'abc', apiKey: 'xyz', name: 'Bob' })).toEqual({
      token: '[REDACTED]',
      apiKey: '[REDACTED]',
      name: 'Bob',
    });
  });

  it('redacts sensitive keys nested inside objects and arrays', () => {
    expect(
      redactSensitiveKeys({
        items: [{ password: 'p', label: 'ok' }],
        session: { authorization: 'Bearer x', id: '1' },
      })
    ).toEqual({
      items: [{ password: '[REDACTED]', label: 'ok' }],
      session: { authorization: '[REDACTED]', id: '1' },
    });
  });

  it('returns primitives and null unchanged', () => {
    expect(redactSensitiveKeys('hello')).toBe('hello');
    expect(redactSensitiveKeys(42)).toBe(42);
    expect(redactSensitiveKeys(null)).toBeNull();
  });
});
