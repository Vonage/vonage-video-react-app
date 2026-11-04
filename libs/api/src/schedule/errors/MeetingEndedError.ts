import { StatusCode } from 'status-code-enum';
import { ApplicationServerError } from '@api-lib/errors';
import type { Any } from '@common/types';

class MeetingEndedError extends ApplicationServerError {
  public override name = 'MeetingEndedError';
}

export const makeMeetingEndedErrorHandler = (fallbackMessage = 'The meeting has ended') => {
  return (error: Any) =>
    new MeetingEndedError({
      src: error,
      fallbackConfig: {
        fallbackMessage,
        statusCode: StatusCode.ClientErrorForbidden,
      },
    });
};

export default MeetingEndedError;
