import { isNil } from '@common/assertions';
import { SessionKeyClaim } from '@common/constants';
import type { ScheduleWindow, SessionKeyPayload } from '@common/types';

const getScheduleWindow = (payload: SessionKeyPayload): ScheduleWindow | null => {
  const schedule = payload[SessionKeyClaim.schedule];

  if (isNil(schedule)) return null;

  const startsAt = schedule.at * 1000;
  const endsAt = startsAt + schedule.min * 60 * 1000;

  return { startsAt, endsAt };
};

export default getScheduleWindow;
