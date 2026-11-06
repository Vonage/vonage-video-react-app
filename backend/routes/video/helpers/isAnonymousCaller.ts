import loadConfig from '../../../helpers/config';
import type { VideoRouteContext } from '../types/VideoRouteContext';

function isAnonymousCaller(ctx: VideoRouteContext): boolean {
  return loadConfig().authEnabled && !ctx.req.user;
}

export default isAnonymousCaller;
