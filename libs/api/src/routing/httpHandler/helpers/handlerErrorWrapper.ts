import type { RequestHandler } from 'express';
import { isPromise } from 'util/types';

/**
 * Wraps an Express request handler to catch both synchronous and asynchronous errors,
 */
const handlerErrorWrapper = <T extends RequestHandler>(
  potentiallyAsyncCallback: T
): RequestHandler => {
  return (req, res, next) => {
    try {
      const result = potentiallyAsyncCallback(req, res, next);

      if (isPromise(result)) {
        return result.catch((err) => {
          logDevelopmentFeedback(err);

          return next(err);
        });
      }

      return result as unknown as void;
    } catch (err) {
      logDevelopmentFeedback(err);

      // handles synchronous errors
      return next(err);
    }
  };
};

function logDevelopmentFeedback(err: unknown): void {
  console.error(err);
}

export default handlerErrorWrapper;
