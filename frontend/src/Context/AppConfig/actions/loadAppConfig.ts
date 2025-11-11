import type { AppConfig } from '../AppConfigContext.types';

export type AppConfigApi = import('../AppConfigContext').AppConfigApi;

/**
 * Loads the application configuration from public/config.json file.
 * If the fetch fails or the content is invalid, it falls back to the default configuration.
 * Finally, it marks the app config as loaded.
 * @returns {Function} The thunk action to load the app config.
 */
function loadAppConfig(this: AppConfigApi['actions']) {
  return async (_: AppConfigApi) => {
    try {
      const response = await fetch('/config.json', {
        cache: 'no-cache',
      });

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('No valid JSON found, using default config');
      }

      const json: Partial<AppConfig> = await response.json();

      this.updateAppConfig(json);
    } finally {
      this.updateAppConfig({
        isAppConfigLoaded: true,
      });
    }
  };
}

export default loadAppConfig;
