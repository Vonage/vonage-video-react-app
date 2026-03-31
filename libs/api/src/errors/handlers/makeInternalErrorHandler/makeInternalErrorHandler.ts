import { StatusCode } from 'status-code-enum';
import ApplicationServerError from '../../ApplicationServerError';
import type { Any } from '@common/types';

export const buildInternalErrorHandler = (fallbackMessage = 'An internal error occurred') => {
  return (error: Any) =>
    new ApplicationServerError({
      src: error,
      fallbackConfig: {
        fallbackMessage,
        statusCode: StatusCode.ServerErrorInternal,
      },
    });
};

export default buildInternalErrorHandler;
