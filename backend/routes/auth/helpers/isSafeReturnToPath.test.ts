import { describe, expect, it } from '@jest/globals';
import isSafeReturnToPath from './isSafeReturnToPath';

describe('isSafeReturnToPath', () => {
  it('accepts a same-origin relative path', () => {
    expect(isSafeReturnToPath('/room/abc123')).toBe(true);
  });

  it.each([
    ['a protocol-relative URL', '//evil.com'],
    ['a backslash-prefixed path', '/\\evil.com'],
    ['an absolute URL', 'https://evil.com'],
    ['a path with no leading slash', 'room/abc123'],
  ])('rejects %s', (_label, value) => {
    expect(isSafeReturnToPath(value)).toBe(false);
  });
});
