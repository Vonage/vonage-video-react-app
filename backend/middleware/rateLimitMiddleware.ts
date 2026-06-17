import rateLimit from 'express-rate-limit';
import { RequestHandler } from 'express';
import { StatusCode } from 'status-code-enum';

const isDevelopment = process.env.NODE_ENV !== 'production';

const rateLimitHandler: RequestHandler = rateLimit({
  // Rate limit window in milliseconds.
  windowMs: 60 * 1000, // 1 minute

  // Max requests per IP per windowMs.
  max: isDevelopment
    ? 10000 // relaxed for local/dev testing
    : 500, // adjust as needed for production

  // Custom message for rate limit exceeded
  message: { error: 'Too many requests, please try again later.' },

  // Status code to return when rate limit is exceeded
  statusCode: StatusCode.ClientErrorTooManyRequests,

  // Enable rate limit headers in the response
  headers: true,

  // Draft-8 is the latest version of the standard headers at the time of this implementation
  // This defines the standard for the `RateLimit-` headers returned in the response, which can be used by clients to understand their current rate limit status.
  standardHeaders: `draft-8`,

  // Disable the `X-RateLimit-` headers
  legacyHeaders: false,
});

const rateLimitMiddleware: RequestHandler = (req, res, next) => {
  return rateLimitHandler(req, res, next);
};

export default rateLimitMiddleware;
