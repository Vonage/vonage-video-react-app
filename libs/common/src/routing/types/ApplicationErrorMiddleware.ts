/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextFunction, Response as ExpressResponse } from 'express';
import ApplicationRequest from './ApplicationRequest';
import ParamsDictionary from './ParamsDictionary';
import Query from './Query';

export type ApplicationErrorMiddleware<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = Query,
  LocalsObj extends Record<string, any> = Record<string, any>,
> = (
  error: any,
  // brings an application request which could contain metadata like the session or the user
  req: ApplicationRequest<P, ResBody, ReqBody, ReqQuery, LocalsObj>,
  res: ExpressResponse<ResBody, LocalsObj>,
  next: NextFunction
) => void | Promise<void>;

export default ApplicationErrorMiddleware;
