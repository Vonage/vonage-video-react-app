import type { VideoAction } from './VideoAction';
import type HandlerConfig from './HandlerConfig';

type AllowedKeys = Exclude<
  VideoAction,
  /**
   * This are non methods which are not accessible through the api or which configuration is inherited from other handlers
   */
  'createEphemeralToken' | 'ensureCaptionsEnabled'
>;

export type HandlersConfig = {
  // exclude private handlers
  [K in AllowedKeys]: HandlerConfig<K>;
};

export default HandlersConfig;
