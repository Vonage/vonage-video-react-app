import type { Response } from 'express';
import type { RequestWithTokenAuth } from '../../../middleware/authMiddleware/authMiddleware';

export type VideoRouteContext = {
  req: RequestWithTokenAuth;
  res: Response;
};
