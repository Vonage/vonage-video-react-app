/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  NextFunction,
  Response as ExpressResponse,
  RequestHandler as ExpressRequestHandler,
} from 'express';
import ApplicationRequest from './ApplicationRequest';
import ParamsDictionary from './ParamsDictionary';
import Query from './Query';

export type ApplicationHandler<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = Query,
  LocalsObj extends Record<string, any> = Record<string, any>,
> = (
  // brings an application request which could contain metadata like the session or the user
  req: ApplicationRequest<P, ResBody, ReqBody, ReqQuery, LocalsObj>,
  res: ExpressResponse<ResBody, LocalsObj>,
  next: NextFunction,
  error?: any
) =>
  | ReturnType<ExpressRequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>>
  | Promise<ReturnType<ExpressRequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>>>;

export default ApplicationHandler;
