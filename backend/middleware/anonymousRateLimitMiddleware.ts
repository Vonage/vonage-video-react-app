import rateLimit from 'express-rate-limit';
import type { RequestHandler } from 'express';
import { StatusCode } from 'status-code-enum';
import loadConfig from '../helpers/config';
import type { RequestWithTokenAuth } from './authMiddleware/authMiddleware';

function anonymousRateLimitMiddleware(): RequestHandler {
  const { authEnabled } = loadConfig();

  return rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    message: { error: 'Too many requests, please try again later.' },
    statusCode: StatusCode.ClientErrorTooManyRequests,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: (req) => !authEnabled || Boolean((req as RequestWithTokenAuth).user),
  });
}

export default anonymousRateLimitMiddleware;
