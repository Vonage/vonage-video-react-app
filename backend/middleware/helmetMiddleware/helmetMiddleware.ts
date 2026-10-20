import helmet from 'helmet';
import type { RequestHandler } from 'express';
import getHelmetOptions from './getHelmetOptions';

const helmetMiddleware: RequestHandler = helmet(
  getHelmetOptions({ isDevelopment: process.env.NODE_ENV !== 'production' })
);

export default helmetMiddleware;
