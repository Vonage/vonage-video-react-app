import type { ScheduleWindow } from '@common/types';
import { makeMeetingNotStartedErrorHandler } from './errors/MeetingNotStartedError';
import { makeMeetingEndedErrorHandler } from './errors/MeetingEndedError';

function assertScheduleOpen({ startsAt, endsAt }: ScheduleWindow): void {
  const now = Date.now();

  if (now < startsAt) {
    throw makeMeetingNotStartedErrorHandler(
      `The meeting has not started yet, it starts at ${new Date(startsAt).toISOString()}`
    )(null);
  }

  if (now >= endsAt) {
    throw makeMeetingEndedErrorHandler(`The meeting ended at ${new Date(endsAt).toISOString()}`)(
      null
    );
  }
}

export default assertScheduleOpen;
