import type { Request as ExpressRequest } from 'express';
import ParamsDictionary from './ParamsDictionary';
import type { Any } from '@common/types';
import type { ParsedQs } from 'qs';

export type ApplicationRequest<
  P = ParamsDictionary,
  ResBody = Any,
  ReqBody = Any,
  ReqQuery = ParsedQs,
  Locals extends Record<string, Any> = Record<string, Any>,
> = ExpressRequest<P, ResBody, ReqBody, ReqQuery, Locals>;

export default ApplicationRequest;
