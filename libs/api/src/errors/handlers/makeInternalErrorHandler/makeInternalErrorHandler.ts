import StatusCodeEnum from 'status-code-enum';
import ApplicationServerError from '../../ApplicationServerError';
import { Any } from '@common/types';

export const buildInternalErrorHandler = (fallbackMessage = 'An internal error occurred') => {
  return (error: Any) =>
    new ApplicationServerError({
      src: error,
      fallbackConfig: {
        fallbackMessage,
        statusCode: StatusCodeEnum.ServerErrorInternal,
      },
    });
};

export default buildInternalErrorHandler;
