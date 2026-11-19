import { describe, it, expect } from 'vitest';
import { SessionKeyClaim } from '@common/constants';
import readExtendedClaim from './readExtendedClaim';

describe('readExtendedClaim', () => {
  it('returns the extended minutes, or 0 when the claim is missing or malformed', () => {
    expect(readExtendedClaim({ sessionId: 'session-id', [SessionKeyClaim.extended]: 40 })).toBe(40);
    expect(readExtendedClaim({ sessionId: 'session-id' })).toBe(0);
    expect(readExtendedClaim({ [SessionKeyClaim.extended]: '40' })).toBe(0);
  });
});
