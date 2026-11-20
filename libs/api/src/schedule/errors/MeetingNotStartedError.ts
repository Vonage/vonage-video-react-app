import { StatusCode } from 'status-code-enum';
import { ApplicationServerError } from '@api-lib/errors';
import type { Any } from '@common/types';

class MeetingNotStartedError extends ApplicationServerError {
  public override name = 'MeetingNotStartedError';
}

export const makeMeetingNotStartedErrorHandler = (
  fallbackMessage = 'The meeting has not started yet'
) => {
  return (error: Any) =>
    new MeetingNotStartedError({
      src: error,
      fallbackConfig: {
        fallbackMessage,
        statusCode: StatusCode.ClientErrorForbidden,
      },
    });
};

export default MeetingNotStartedError;
