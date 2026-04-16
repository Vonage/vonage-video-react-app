import { StatusCode } from 'status-code-enum';
import ApplicationServerError from '../../ApplicationServerError';

// ApplicationServerError
const makeBadRequestErrorHandler = (fallbackMessage = 'Bad request') => {
  return (error: unknown) =>
    new ApplicationServerError({
      src: error,
      fallbackConfig: {
        fallbackMessage,
        statusCode: StatusCode.ClientErrorBadRequest,
      },
    });
};

export default makeBadRequestErrorHandler;
