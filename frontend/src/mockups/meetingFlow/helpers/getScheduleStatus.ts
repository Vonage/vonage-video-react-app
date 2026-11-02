import type { MeetingSchedule } from '../types/MeetingSchedule';
import type { ScheduleStatus } from '../types/ScheduleStatus';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/**
 * Resolves which waiting-room state a schedule is in at a given moment.
 */
function getScheduleStatus({
  schedule,
  now,
}: {
  schedule: MeetingSchedule | null;
  now: Date;
}): ScheduleStatus {
  if (schedule === null) return { kind: 'unscheduled' };

  const startsAt = schedule.startsAt;
  const endsAt = new Date(startsAt.getTime() + schedule.durationMinutes * MINUTE_MS);
  const isRecurring = schedule.recurrence !== 'none';
  const millisecondsUntilStart = startsAt.getTime() - now.getTime();

  if (now >= endsAt) return { kind: 'ended', endsAt, isRecurring };
  if (millisecondsUntilStart <= 0) return { kind: 'started', startsAt, endsAt, isRecurring };

  if (millisecondsUntilStart <= 5 * MINUTE_MS) {
    return {
      kind: 'withinFiveMinutes',
      startsAt,
      endsAt,
      isRecurring,
      secondsLeft: Math.ceil(millisecondsUntilStart / 1000),
    };
  }

  if (millisecondsUntilStart <= HOUR_MS) {
    return {
      kind: 'withinHour',
      startsAt,
      endsAt,
      isRecurring,
      minutesLeft: Math.ceil(millisecondsUntilStart / MINUTE_MS),
    };
  }

  if (millisecondsUntilStart <= DAY_MS) {
    return {
      kind: 'withinDay',
      startsAt,
      endsAt,
      isRecurring,
      minutesLeft: Math.ceil(millisecondsUntilStart / MINUTE_MS),
    };
  }

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMeetingDay = new Date(
    startsAt.getFullYear(),
    startsAt.getMonth(),
    startsAt.getDate()
  );

  return {
    kind: 'daysAway',
    startsAt,
    endsAt,
    isRecurring,
    daysLeft: Math.round((startOfMeetingDay.getTime() - startOfToday.getTime()) / DAY_MS),
  };
}

export default getScheduleStatus;
