import StatusCodeEnum from 'status-code-enum';
import ApplicationServerError from '../ApplicationServerError';

export const buildInternalErrorHandler = (
  fallbackMessage = 'An internal error occurred'
) => {
  return (error: any) =>
    new ApplicationServerError({
      src: error,
      fallbackConfig: {
        fallbackMessage,
        statusCode: StatusCodeEnum.ServerErrorInternal,
      },
    });
};

export default buildInternalErrorHandler;
