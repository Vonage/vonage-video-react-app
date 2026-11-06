import getMeetingStartsAt from '../getMeetingStartsAt';

const minuteInMilliseconds = 60_000;

/**
 * True when the date and time are filled in and are not before the current minute.
 */
function isMeetingStartValid({
  startDate,
  startTime,
  now,
}: {
  startDate: string;
  startTime: string;
  now: number;
}): boolean {
  const startsAt = getMeetingStartsAt({ startDate, startTime });
  const startOfCurrentMinute = Math.floor(now / minuteInMilliseconds) * minuteInMilliseconds;

  return Number.isFinite(startsAt) && startsAt >= startOfCurrentMinute;
}

export default isMeetingStartValid;
