/* eslint-disable @typescript-eslint/no-explicit-any */
import { RequestHandler as ExpressRequestHandler } from 'express';

import type {
  ParamsDictionary,
  ApplicationRequestHandler,
  Query,
  ApplicationHandler,
} from '../types';

import composeHandlers from './helpers/composeHandlers';

/**
 * Extended Request Handler with a `contact` method to chain additional middlewares.
 */
type ExtendedRequestHandler<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = Query,
  Locals extends Record<string, any> = Record<string, any>,
> = ExpressRequestHandler<P, ResBody, ReqBody, ReqQuery, Locals> & {
  contact: <
    T extends Array<
      ExpressRequestHandler<any, any, any, any, any> | ApplicationHandler<any, any, any, any, any>
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
  ResBody = any,
  ReqBody = any,
  ReqQuery = Query,
  Locals extends Record<string, any> = Record<string, any>,
>(
  callback: ApplicationRequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>
): ExtendedRequestHandler;

/**
 * Helper for creating Express handlers with built-in async error handling and a forced return type to prevent dead ends
 */
function httpHandler<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = Query,
  Locals extends Record<string, any> = Record<string, any>,
>(
  ...args: [
    ...middlewares: (ExpressRequestHandler | ApplicationHandler)[],
    callback: ApplicationRequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>,
  ]
): ExtendedRequestHandler;

function httpHandler<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = Query,
  Locals extends Record<string, any> = Record<string, any>,
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
