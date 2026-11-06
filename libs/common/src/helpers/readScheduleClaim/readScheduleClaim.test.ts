import { describe, it, expect } from 'vitest';
import { SessionKeyClaim } from '@common/constants';
import readScheduleClaim from './readScheduleClaim';

describe('readScheduleClaim', () => {
  it('returns the schedule claim only when it is well formed', () => {
    expect(
      readScheduleClaim({ sessionId: 'session-id', [SessionKeyClaim.schedule]: { at: 1, min: 60 } })
    ).toEqual({ at: 1, min: 60 });
    expect(readScheduleClaim({ sessionId: 'session-id' })).toBeNull();
    expect(readScheduleClaim({ [SessionKeyClaim.schedule]: { at: '1', min: 60 } })).toBeNull();
  });
});
