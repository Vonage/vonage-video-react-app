import { isNil } from '@common/assertions';
import type { ScheduleWindow } from '@common/types';
import type { ScheduleStatus } from '../../types/ScheduleStatus';

const minuteInMilliseconds = 60_000;
const hourInMilliseconds = 60 * minuteInMilliseconds;
const dayInMilliseconds = 24 * hourInMilliseconds;

function getScheduleStatus({
  scheduleWindow,
  now,
}: {
  scheduleWindow: ScheduleWindow | null;
  now: number;
}): ScheduleStatus {
  if (isNil(scheduleWindow)) return { kind: 'unscheduled' };

  const { startsAtMs, endsAtMs } = scheduleWindow;
  const millisecondsUntilStart = startsAtMs - now;

  if (now >= endsAtMs) return { kind: 'ended', endsAtMs };
  if (millisecondsUntilStart <= 0) return { kind: 'started', startsAtMs, endsAtMs };

  if (millisecondsUntilStart <= 5 * minuteInMilliseconds) {
    const secondsLeft = Math.ceil(millisecondsUntilStart / 1000);
    return { kind: 'withinFiveMinutes', startsAtMs, endsAtMs, secondsLeft };
  }

  const minutesLeft = Math.ceil(millisecondsUntilStart / minuteInMilliseconds);

  if (millisecondsUntilStart <= hourInMilliseconds) {
    return { kind: 'withinHour', startsAtMs, endsAtMs, minutesLeft };
  }

  if (millisecondsUntilStart <= dayInMilliseconds) {
    return { kind: 'withinDay', startsAtMs, endsAtMs, minutesLeft };
  }

  return {
    kind: 'daysAway',
    startsAtMs,
    endsAtMs,
    daysLeft: getCalendarDaysBetween({ from: now, to: startsAtMs }),
  };
}

function getCalendarDaysBetween({ from, to }: { from: number; to: number }): number {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const startOfFromDay = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const startOfToDay = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());

  return Math.round((startOfToDay.getTime() - startOfFromDay.getTime()) / dayInMilliseconds);
}

export default getScheduleStatus;
