import tryCatch from '@common/execution/tryCatch';
import type { AppConfig } from '..';
import env from '../../../env';

export type AppConfigApi = import('../AppConfigStore').AppConfigApi;

/**
 * Loads the application configuration from public/config.json file.
 * If the fetch fails or the content is invalid, it falls back to the default configuration.
 * Finally, it marks the app config as loaded.
 * @returns {Function} The thunk action to load the app config.
 */
function loadAppConfig(this: AppConfigApi['actions']) {
  return async ({ getMetadata }: AppConfigApi) => {
    const meta = getMetadata();

    meta.loadAppConfigPromise = (async () => {
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
    })();

    return meta.loadAppConfigPromise;
  };
}

export default loadAppConfig;
