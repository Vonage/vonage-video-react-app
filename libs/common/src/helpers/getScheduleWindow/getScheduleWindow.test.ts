import { describe, it, expect } from 'vitest';
import { SessionKeyClaim } from '@common/constants';
import getScheduleWindow from './getScheduleWindow';

describe('getScheduleWindow', () => {
  it('derives the start and end in milliseconds from the schedule claim', () => {
    const scheduleWindow = getScheduleWindow({
      sessionId: 'session-id',
      [SessionKeyClaim.schedule]: { at: 1_800_000_000, min: 60 },
    });

    expect(scheduleWindow).toEqual({
      startsAt: 1_800_000_000_000,
      endsAt: 1_800_003_600_000,
    });
  });

  it('returns null for a key without a schedule', () => {
    expect(getScheduleWindow({ sessionId: 'session-id', roomName: 'room' })).toBeNull();
  });
});
