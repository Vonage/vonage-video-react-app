import type HandlersConfig from './HandlersConfig';

/**
 * Defines the default values for the handlers in the video API
 */
export type HandlersDefaults = {
  [key in keyof HandlersConfig]?: HandlersConfig[key]['addDefaults'];
};

export default HandlersDefaults;
