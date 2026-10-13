import { StatusCode } from 'status-code-enum';
import ApplicationServerError from '../../ApplicationServerError';
import type { Any } from '@common/types';

export const buildNotFoundErrorHandler = (fallbackMessage = 'Resource not found') => {
  return (error: Any) =>
    new ApplicationServerError({
      src: error,
      fallbackConfig: {
        fallbackMessage,
        statusCode: StatusCode.ClientErrorNotFound,
      },
    });
};

export default buildNotFoundErrorHandler;
