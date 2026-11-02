import { describe, it, expect } from 'vitest';
import getCookieValue from './';

describe('getCookieValue', () => {
  it('should return the value of a named cookie among several', () => {
    const cookieHeader = 'foo=bar; oidc_session_id=abc123; baz=qux';
    expect(getCookieValue({ cookieHeader, name: 'oidc_session_id' })).toBe('abc123');
  });

  it('should return undefined when the cookie is missing or the header is absent', () => {
    expect(getCookieValue({ cookieHeader: 'foo=bar', name: 'oidc_session_id' })).toBeUndefined();
    expect(getCookieValue({ cookieHeader: undefined, name: 'oidc_session_id' })).toBeUndefined();
  });
});
