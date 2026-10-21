import cors from 'cors';
import { isAllowedOrigin } from '@common/helpers';
import loadConfig from '../../helpers/config';

function corsMiddleware() {
  const { corsAllowedOrigins } = loadConfig();

  return cors({
    credentials: true,
    origin: (requestOrigin, callback) => {
      const isRequestWithoutOrigin = requestOrigin === undefined;

      callback(
        null,
        isRequestWithoutOrigin ||
          isAllowedOrigin({ origin: requestOrigin, allowedOrigins: corsAllowedOrigins })
      );
    },
  });
}

export default corsMiddleware;
