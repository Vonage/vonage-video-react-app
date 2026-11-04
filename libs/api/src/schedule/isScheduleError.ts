import MeetingEndedError from './errors/MeetingEndedError';
import MeetingNotStartedError from './errors/MeetingNotStartedError';

function isScheduleError(error: unknown): error is MeetingNotStartedError | MeetingEndedError {
  return error instanceof MeetingNotStartedError || error instanceof MeetingEndedError;
}

export default isScheduleError;
