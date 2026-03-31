import type {
  NextFunction,
  Response as ExpressResponse,
  RequestHandler as ExpressRequestHandler,
} from 'express';
import ApplicationRequest from './ApplicationRequest';
import ParamsDictionary from './ParamsDictionary';
import Query from './Query';
import type { Any } from '@common/types';

export type ApplicationHandler<
  P = ParamsDictionary,
  ResBody = Any,
  ReqBody = Any,
  ReqQuery = Query,
  LocalsObj extends Record<string, Any> = Record<string, Any>,
> = (
  // brings an application request which could contain metadata like the session or the user
  req: ApplicationRequest<P, ResBody, ReqBody, ReqQuery, LocalsObj>,
  res: ExpressResponse<ResBody, LocalsObj>,
  next: NextFunction,
  error?: Any
) =>
  | ReturnType<ExpressRequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>>
  | Promise<ReturnType<ExpressRequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>>>;

export default ApplicationHandler;
