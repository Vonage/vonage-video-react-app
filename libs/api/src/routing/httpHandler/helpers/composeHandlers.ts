import type { RequestHandler } from 'express';
import handlerErrorWrapper from './handlerErrorWrapper';
import tryCatch from '@common/execution/tryCatch';
import { defer } from '@common/execution';
import { isNil, isUndefined } from '@common/assertions';
import isPromise from '@common/assertions/isPromise';
import type { Any } from '@common/types';

/**
 * Merge and promisify a collection of HTTP handlers into a single asynchronous handler.
 */
const composeHandlers = <T extends Array<RequestHandler<Any, Any, Any, Any, Any>>>(
  ...args: T
): RequestHandler => {
  const safeHandlers = args.map((handler) => handlerErrorWrapper(handler));

  return (req, res, finalNext) => {
    const deferred = defer<void>();
    const handlers = [...safeHandlers];

    let isPipeComplete = false;
    const next = (error?: unknown) => {
      if (isPipeComplete) return;

      isPipeComplete = true;

      const { error: nextError } = tryCatch(() => {
        if (!isUndefined(error)) {
          finalNext(error);
          return;
        }

        finalNext();
      });

      if (nextError) {
        console.error('Error in finalNext:', nextError);
      }

      deferred.resolve();
    };

    /**
     * Executes the handlers recursively.
     */
    const executeNextSegment = async (error?: unknown) => {
      const handler = handlers.shift();
      if (error || isNil(handler)) {
        next(error);
        return;
      }

      const isLastHandler = handlers.length === 0;
      const handlerResult = handler(req, res, executeNextSegment);

      // Normalize to a promise that never rejects - errors are forwarded to next()
      const safePromise = isPromise(handlerResult)
        ? handlerResult.catch((err: unknown) => {
            next(err);
          })
        : Promise.resolve(handlerResult);

      if (isLastHandler) {
        await safePromise;
        // Only call next if the response hasn't been sent to prevent "headers already sent" errors
        if (!res.headersSent && !res.writableEnded) {
          next();
        }
      }

      return deferred.promise;
    };

    return executeNextSegment();
  };
};

export default composeHandlers;
