import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import type { WaitingStatus } from '../types/ScheduleStatus';
import getCountdownText from './getCountdownText';

const t = ((key: string, options: Record<string, number>) =>
  `${key} ${JSON.stringify(options)}`) as unknown as TFunction;

const times = { startsAtMs: 0, endsAtMs: 0 };

describe('getCountdownText', () => {
  it.each<[string, WaitingStatus, string]>([
    [
      'drops zero minutes from whole hours',
      { ...times, kind: 'withinDay', minutesLeft: 60 },
      'waitingRoom.schedule.countdown.hours {"hours":1}',
    ],
    [
      'drops zero seconds from whole minutes',
      { ...times, kind: 'withinFiveMinutes', secondsLeft: 240 },
      'waitingRoom.schedule.countdown.minutes {"minutes":4}',
    ],
    [
      'keeps both non-zero segments',
      { ...times, kind: 'withinFiveMinutes', secondsLeft: 68 },
      'waitingRoom.schedule.countdown.minutesAndSeconds {"minutes":1,"seconds":8}',
    ],
    [
      'shows only seconds under a minute',
      { ...times, kind: 'withinFiveMinutes', secondsLeft: 45 },
      'waitingRoom.schedule.countdown.seconds {"seconds":45}',
    ],
  ])('%s', (_label, waitingStatus, expected) => {
    expect(getCountdownText({ waitingStatus, t })).toBe(expected);
  });
});
