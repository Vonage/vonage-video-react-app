import { rateLimit } from 'express-rate-limit';
import { StatusCode } from 'status-code-enum';
import { ApplicationServerError } from '@api-lib/errors';

const anonymousSessionCreationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: false,
  legacyHeaders: false,
  validate: { singleCount: false },
  handler: (_req, _res, next) => {
    next(
      new ApplicationServerError({
        src: null,
        fallbackConfig: {
          fallbackMessage: 'Too many sessions created, please try again later.',
          statusCode: StatusCode.ClientErrorTooManyRequests,
        },
      })
    );
  },
});

export default anonymousSessionCreationLimiter;
