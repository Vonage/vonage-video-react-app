import type { ScheduleWindow } from '@common/types';
import { makeMeetingNotStartedErrorHandler } from './errors/MeetingNotStartedError';
import { makeMeetingEndedErrorHandler } from './errors/MeetingEndedError';

function assertScheduleOpen({ startsAtMs, endsAtMs }: ScheduleWindow): void {
  const now = Date.now();

  if (now < startsAtMs) {
    throw makeMeetingNotStartedErrorHandler(
      `The meeting has not started yet, it starts at ${new Date(startsAtMs).toISOString()}`
    )(null);
  }

  if (now >= endsAtMs) {
    throw makeMeetingEndedErrorHandler(`The meeting ended at ${new Date(endsAtMs).toISOString()}`)(
      null
    );
  }
}

export default assertScheduleOpen;
