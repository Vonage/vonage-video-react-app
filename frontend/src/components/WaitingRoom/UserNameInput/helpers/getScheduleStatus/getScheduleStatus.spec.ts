import { describe, expect, it } from 'vitest';
import getScheduleStatus from './getScheduleStatus';

const minute = 60_000;
const startsAt = new Date(2026, 10, 4, 12, 0).getTime();
const endsAt = startsAt + 60 * minute;
const scheduleWindow = { startsAtMs: startsAt, endsAtMs: endsAt };

describe('getScheduleStatus', () => {
  it.each([
    ['two calendar days before', startsAt - 48 * 60 * minute, { kind: 'daysAway', daysLeft: 2 }],
    ['24 hours before', startsAt - 24 * 60 * minute, { kind: 'withinDay', minutesLeft: 1440 }],
    ['one hour before', startsAt - 60 * minute, { kind: 'withinHour', minutesLeft: 60 }],
    ['five minutes before', startsAt - 5 * minute, { kind: 'withinFiveMinutes', secondsLeft: 300 }],
    ['one second before', startsAt - 1000, { kind: 'withinFiveMinutes', secondsLeft: 1 }],
    ['at the start', startsAt, { kind: 'started' }],
    ['one millisecond before the end', endsAt - 1, { kind: 'started' }],
    ['at the end', endsAt, { kind: 'ended' }],
  ])('%s', (_label, now, expected) => {
    expect(getScheduleStatus({ scheduleWindow, now })).toMatchObject(expected);
  });

  it('is unscheduled without a schedule window', () => {
    expect(getScheduleStatus({ scheduleWindow: null, now: startsAt })).toEqual({
      kind: 'unscheduled',
    });
  });
});
