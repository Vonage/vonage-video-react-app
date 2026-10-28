import type { ActiveTokenIntrospectionResponse } from '../../../middleware/authMiddleware/schemas/TokenIntrospectionResponse.schema';
import type { Request } from 'express';

export type RequestWithTokenAuth = Request & {
  user?: ActiveTokenIntrospectionResponse;
};

export type VideoRouteContext = {
  user?: ActiveTokenIntrospectionResponse;
};
