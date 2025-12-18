import StatusCodeEnum from 'status-code-enum';
import ApplicationServerError from '../ApplicationServerError';

export const buildUnauthorizedErrorHandler = (
  fallbackMessage = 'Unauthorized access'
) => {
  return (error: any) =>
    new ApplicationServerError({
      src: error,
      fallbackConfig: {
        fallbackMessage,
        statusCode: StatusCodeEnum.ClientErrorUnauthorized,
      },
    });
};

export default buildUnauthorizedErrorHandler;
