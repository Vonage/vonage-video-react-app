import type { VideoAction } from './VideoAction';
import type HandlerConfig from './HandlerConfig';

type AllowedKeys = Exclude<
  VideoAction,
  /**
   * Actions that are not accessible through the api, inherit their configuration from other handlers, or take no configuration
   */
  'createEphemeralToken' | 'ensureCaptionsEnabled' | 'getServerSettings'
>;

export type HandlersConfig = {
  // exclude private handlers
  [K in AllowedKeys]: HandlerConfig<K>;
};

export default HandlersConfig;
