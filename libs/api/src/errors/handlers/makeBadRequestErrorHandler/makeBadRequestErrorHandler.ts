import StatusCodeEnum from 'status-code-enum';
import ApplicationServerError from '../../ApplicationServerError';

// ApplicationServerError
const makeBadRequestErrorHandler = (fallbackMessage = 'Bad request') => {
  return (error: unknown) =>
    new ApplicationServerError({
      src: error,
      fallbackConfig: {
        fallbackMessage,
        statusCode: StatusCodeEnum.ClientErrorBadRequest,
      },
    });
};

export default makeBadRequestErrorHandler;
