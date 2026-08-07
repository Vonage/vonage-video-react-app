import { StatusCode } from 'status-code-enum';
import ApplicationServerError from '../../ApplicationServerError';
import type { Any } from '@common/types';

export const buildUnauthorizedErrorHandler = (fallbackMessage = 'Unauthorized access') => {
  return (error: Any) =>
    new ApplicationServerError({
      src: error,
      fallbackConfig: {
        fallbackMessage,
        statusCode: StatusCode.ClientErrorUnauthorized,
      },
    });
};

export default buildUnauthorizedErrorHandler;
