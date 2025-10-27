import { useMemo, useEffect } from 'react';
import AppConfigStore, { AppConfig, defaultConfig, mergeAppConfigs } from '../AppConfigStore';

function useConfig(): AppConfigStore {
  const store = useMemo(() => new AppConfigStore(defaultConfig), []);

  useEffect(() => {
    // Try to load config from JSON file located at frontend/public/config.json
    const loadConfig = async () => {
      try {
        const response = await fetch('/config.json', {
          cache: 'no-cache',
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.info('No valid JSON found, using default config');
          return;
        }

        const json: Partial<AppConfig> = await response.json();

        store.setState((state) => ({
          ...mergeAppConfigs({ previous: state, updates: json }),
          isLoaded: true,
        }));
      } catch (error) {
        console.error('Error loading config:', error);
      }
    };

    loadConfig();
  }, [store]);

  return store;
}

export default useConfig;
