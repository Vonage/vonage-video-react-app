import tryCatch from '@common/execution/tryCatch';
import type { AppConfig } from '../AppConfigContext.types';
import env from '../../../env';

export type AppConfigApi = import('../AppConfigContext').AppConfigApi;

/**
 * Loads the application configuration from public/config.json file.
 * If the fetch fails or the content is invalid, it falls back to the default configuration.
 * Finally, it marks the app config as loaded.
 * @returns {Function} The thunk action to load the app config.
 */
function loadAppConfig(this: AppConfigApi['actions']) {
  return async (_: AppConfigApi) => {
    const fallbackConfig: Partial<AppConfig> = {};

    const { result: config, error } = await tryCatch(async () => {
      // Skip fetching config in CI environments
      if (env.VITE_AVOID_FETCHING_APP_CONFIG) return {};

      const response = await fetch('/config.json', { cache: 'no-cache' });

      const contentType = response.headers.get('content-type');

      if (!contentType?.includes('application/json')) {
        throw new Error('No valid JSON found, using default config');
      }

      // [TODO]: Validate schema of json
      const json: Partial<AppConfig> = await response.json();

      return json;
    }, fallbackConfig);

    if (error && env.MODE === 'development') {
      console.error(
        [
          'There was an error loading config.json',
          'Please make sure to provide a valid config.json file in the public folder.',
        ].join('\n'),
        error
      );
    }

    this.updateAppConfig({ ...config, isAppConfigLoaded: true });
  };
}

export default loadAppConfig;
