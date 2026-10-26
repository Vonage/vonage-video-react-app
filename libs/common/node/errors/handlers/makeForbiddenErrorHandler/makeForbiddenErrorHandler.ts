import { StatusCode } from 'status-code-enum';
import ApplicationServerError from '../../ApplicationServerError';
import type { Any } from '@common/types';

export const buildForbiddenErrorHandler = (fallbackMessage = 'Forbidden') => {
  return (error: Any) =>
    new ApplicationServerError({
      src: error,
      fallbackConfig: {
        fallbackMessage,
        statusCode: StatusCode.ClientErrorForbidden,
      },
    });
};

export default buildForbiddenErrorHandler;
