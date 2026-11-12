import { describe, it, expect } from 'vitest';
import { SessionKeyClaim } from '@common/constants';
import readScheduleClaim from './readScheduleClaim';

describe('readScheduleClaim', () => {
  it('returns the schedule claim only when it is well formed', () => {
    expect(
      readScheduleClaim({
        sessionId: 'session-id',
        [SessionKeyClaim.schedule]: { startsAtMs: 1, endsAtMs: 3_600_001 },
      })
    ).toEqual({ startsAtMs: 1, endsAtMs: 3_600_001 });
    expect(readScheduleClaim({ sessionId: 'session-id' })).toBeNull();
    expect(
      readScheduleClaim({ [SessionKeyClaim.schedule]: { startsAtMs: '1', endsAtMs: 3_600_001 } })
    ).toBeNull();
  });
});
