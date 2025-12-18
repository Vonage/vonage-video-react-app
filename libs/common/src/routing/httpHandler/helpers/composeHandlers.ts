/* eslint-disable @typescript-eslint/no-explicit-any */
import { RequestHandler } from 'express';
import handlerErrorWrapper from './handlerErrorWrapper';
import deferred from '@common/execution/deferred';
import { isNil, isUndefined } from '@common/data/nils';
import tryCatch from '@common/execution/tryCatch';

/**
 * Merge and promisify a collection of HTTP handlers into a single asynchronous handler.
 */
const composeHandlers = <T extends Array<RequestHandler<any, any, any, any, any>>>(
  ...args: T
): RequestHandler => {
  const safeHandlers = args.map((handler) => handlerErrorWrapper(handler));

  return (req, res, finalNext) => {
    const defer = deferred<void>();
    const handlers = [...safeHandlers];

    let isPipeComplete = false;
    const next = (error?: unknown) => {
      if (isPipeComplete) return;

      isPipeComplete = true;

      if (!isUndefined(error)) {
        finalNext(error);
        defer.resolve();
        return;
      }

      finalNext();
      defer.resolve();
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
      if (!isLastHandler) {
        handler(req, res, executeNextSegment);
        return defer.promise;
      }

      const { error: asyncError } = await tryCatch(
        () => handler(req, res, executeNextSegment) as unknown as Promise<void>
      );

      if (asyncError) {
        next(asyncError);
        return;
      }

      next();
    };

    return executeNextSegment();
  };
};

export default composeHandlers;
