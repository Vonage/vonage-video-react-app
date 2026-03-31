import type { VideoAction } from './VideoAction';
import type HandlerConfig from './HandlerConfig';

export type HandlersConfig = {
  // exclude private handlers
  [K in Exclude<VideoAction, 'createEphemeralToken'>]: HandlerConfig<K>;
};

export default HandlersConfig;
