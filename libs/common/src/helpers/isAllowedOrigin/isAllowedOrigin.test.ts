import { describe, it, expect } from 'vitest';
import isAllowedOrigin from './';

const PR_WILDCARD = 'https://vera-pr-*.euw1.runtime.vonage.cloud';

describe('isAllowedOrigin', () => {
  it('matches exact origins and a single wildcard in the first host label', () => {
    const allowedOrigins = ['https://vera.example.com', PR_WILDCARD];

    expect(isAllowedOrigin({ origin: 'https://vera.example.com', allowedOrigins })).toBe(true);
    expect(
      isAllowedOrigin({ origin: 'https://vera-pr-835.euw1.runtime.vonage.cloud', allowedOrigins })
    ).toBe(true);
    expect(isAllowedOrigin({ origin: 'https://other.example.com', allowedOrigins })).toBe(false);
  });

  it('does not let the wildcard span dots, so other hosts under the same suffix are rejected', () => {
    expect(
      isAllowedOrigin({
        origin: 'https://vera-pr-evil.attacker.euw1.runtime.vonage.cloud',
        allowedOrigins: [PR_WILDCARD],
      })
    ).toBe(false);
  });

  it('allows any origin for a lone "*"', () => {
    expect(isAllowedOrigin({ origin: 'http://localhost:5173', allowedOrigins: '*' })).toBe(true);
  });
});
