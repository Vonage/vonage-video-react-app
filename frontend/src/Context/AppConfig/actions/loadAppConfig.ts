import type { AppConfig } from '../AppConfigContext.types';

export type AppConfigActions = import('../AppConfigContext').AppConfigActions;
export type AppConfigContext = import('../AppConfigContext').AppConfigContextType;

function loadAppConfig(this: AppConfigActions) {
  return async (_: AppConfigContext) => {
    try {
      const response = await fetch('/config.json', {
        cache: 'no-cache',
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
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
