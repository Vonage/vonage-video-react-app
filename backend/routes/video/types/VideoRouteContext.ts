import type { ActiveTokenIntrospectionResponse } from '../../../middleware/authMiddleware/schemas/TokenIntrospectionResponse.schema';

export type VideoRouteContext = {
  user?: ActiveTokenIntrospectionResponse;
};
