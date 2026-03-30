import type { NextFunction, Response as ExpressResponse } from 'express';
import ApplicationRequest from './ApplicationRequest';
import ParamsDictionary from './ParamsDictionary';
import Query from './Query';
import type { Any } from '@common/types';

export type ApplicationRequestHandler<
  P = ParamsDictionary,
  ResBody = Any,
  ReqBody = Any,
  ReqQuery = Query,
  LocalsObj extends Record<string, Any> = Record<string, Any>,
> = (
  // brings an application request which could contain metadata like the session or the user
  req: ApplicationRequest<P, ResBody, ReqBody, ReqQuery, LocalsObj>,
  res: ExpressResponse<ResBody, LocalsObj>,
  next: NextFunction

  /**
   * forces the handler to return an ExpressResponse, this prevent dead ends
   */
) => ExpressResponse | Promise<ExpressResponse>;

export default ApplicationRequestHandler;
