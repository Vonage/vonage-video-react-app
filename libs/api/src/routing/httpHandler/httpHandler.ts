import type { RequestHandler as ExpressRequestHandler } from 'express';

import type {
  ParamsDictionary,
  ApplicationRequestHandler,
  Query,
  ApplicationHandler,
} from '@api-lib/types';

import composeHandlers from './helpers/composeHandlers';
import type { Any } from '@common/types';

/**
 * Extended Request Handler with a `contact` method to chain additional middlewares.
 */
type ExtendedRequestHandler<
  P = ParamsDictionary,
  ResBody = Any,
  ReqBody = Any,
  ReqQuery = Query,
  Locals extends Record<string, Any> = Record<string, Any>,
> = ExpressRequestHandler<P, ResBody, ReqBody, ReqQuery, Locals> & {
  contact: <
    T extends Array<
      ExpressRequestHandler<Any, Any, Any, Any, Any> | ApplicationHandler<Any, Any, Any, Any, Any>
    >,
  >(
    ...middlewares: T
  ) => ExpressRequestHandler;
};

/**
 * Helper for creating Express handlers with built-in async error handling and a forced return type to prevent dead ends
 */
function httpHandler<
  P = ParamsDictionary,
  ResBody = Any,
  ReqBody = Any,
  ReqQuery = Query,
  Locals extends Record<string, Any> = Record<string, Any>,
>(
  callback: ApplicationRequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>
): ExtendedRequestHandler;

/**
 * Helper for creating Express handlers with built-in async error handling and a forced return type to prevent dead ends
 */
function httpHandler<
  P = ParamsDictionary,
  ResBody = Any,
  ReqBody = Any,
  ReqQuery = Query,
  Locals extends Record<string, Any> = Record<string, Any>,
>(
  ...args: [
    ...middlewares: (ExpressRequestHandler | ApplicationHandler)[],
    callback: ApplicationRequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>,
  ]
): ExtendedRequestHandler;

function httpHandler<
  P = ParamsDictionary,
  ResBody = Any,
  ReqBody = Any,
  ReqQuery = Query,
  Locals extends Record<string, Any> = Record<string, Any>,
>(
  ...handlers: (
    | ExpressRequestHandler
    | ApplicationHandler
    | ApplicationRequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>
  )[]
): ExtendedRequestHandler {
  const pipe = [...handlers] as ExpressRequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>[];

  const combinedHandler = composeHandlers(...pipe) as ExtendedRequestHandler;

  combinedHandler.contact = (...middlewares) => {
    return composeHandlers(combinedHandler, ...(middlewares as ExpressRequestHandler[]));
  };

  return combinedHandler;
}

export default httpHandler;
