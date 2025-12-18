/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request as ExpressRequest } from 'express';
import ParamsDictionary from './ParamsDictionary';

export type ApplicationRequest<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = qs.ParsedQs,
  Locals extends Record<string, any> = Record<string, any>,
> = ExpressRequest<P, ResBody, ReqBody, ReqQuery, Locals>;

export default ApplicationRequest;
