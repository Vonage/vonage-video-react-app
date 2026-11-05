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

  const { startsAt, endsAt } = scheduleWindow;
  const millisecondsUntilStart = startsAt - now;

  if (now >= endsAt) return { kind: 'ended', endsAt };
  if (millisecondsUntilStart <= 0) return { kind: 'started', startsAt, endsAt };

  if (millisecondsUntilStart <= 5 * minuteInMilliseconds) {
    const secondsLeft = Math.ceil(millisecondsUntilStart / 1000);
    return { kind: 'withinFiveMinutes', startsAt, endsAt, secondsLeft };
  }

  const minutesLeft = Math.ceil(millisecondsUntilStart / minuteInMilliseconds);

  if (millisecondsUntilStart <= hourInMilliseconds) {
    return { kind: 'withinHour', startsAt, endsAt, minutesLeft };
  }

  if (millisecondsUntilStart <= dayInMilliseconds) {
    return { kind: 'withinDay', startsAt, endsAt, minutesLeft };
  }

  return {
    kind: 'daysAway',
    startsAt,
    endsAt,
    daysLeft: getCalendarDaysBetween({ from: now, to: startsAt }),
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
