import StatusCodeEnum from 'status-code-enum';
import ApplicationError from '../ApplicationError';

// ApplicationServerError
const makeBadRequestErrorHandler = (fallbackMessage = 'Bad request') => {
  return (error: unknown) =>
    new ApplicationError({
      src: error,
      fallbackConfig: {
        fallbackMessage,
        statusCode: StatusCodeEnum.ClientErrorBadRequest,
      },
    });
};

export default makeBadRequestErrorHandler;
