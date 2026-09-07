import type { NextFunction, Response as ExpressResponse } from 'express';
import ApplicationRequest from './ApplicationRequest';
import ParamsDictionary from './ParamsDictionary';
import Query from './Query';
import type { Any } from '@common/types/Any';

export type ApplicationErrorMiddleware<
  P = ParamsDictionary,
  ResBody = Any,
  ReqBody = Any,
  ReqQuery = Query,
  LocalsObj extends Record<string, Any> = Record<string, Any>,
> = (
  error: Any,
  // brings an application request which could contain metadata like the session or the user
  req: ApplicationRequest<P, ResBody, ReqBody, ReqQuery, LocalsObj>,
  res: ExpressResponse<ResBody, LocalsObj>,
  next: NextFunction
) => void | Promise<void>;

export default ApplicationErrorMiddleware;
