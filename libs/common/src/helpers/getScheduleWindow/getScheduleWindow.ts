import { isNil } from '@common/assertions';
import { SessionKeyClaim } from '@common/constants';
import type { ScheduleWindow, SessionKeyPayload } from '@common/types';

const getScheduleWindow = (payload: SessionKeyPayload): ScheduleWindow | null => {
  const schedule = payload[SessionKeyClaim.schedule];

  if (isNil(schedule)) return null;

  const extendedMinutes = payload[SessionKeyClaim.extended] ?? 0;
  const startsAt = schedule.at * 1000;
  const endsAt = startsAt + (schedule.min + extendedMinutes) * 60 * 1000;

  return { startsAt, endsAt };
};

export default getScheduleWindow;
