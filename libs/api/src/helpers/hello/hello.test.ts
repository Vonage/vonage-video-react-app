import { describe, expect, test } from 'vitest';
import { hello } from '@api-lib';

describe('hello', () => {
  test('returns hello with name', () => {
    expect(hello('world')).toBe('hello world');
  });
});
