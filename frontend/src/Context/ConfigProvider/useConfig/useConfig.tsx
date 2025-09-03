import { useMemo } from 'react';

export type VideoSettings = {
  enableDisableCapableCamera: boolean;
  resolution: '1920x1080' | '1280x960' | '1280x720' | '640x480' | '640x360' | '320x240' | '320x180';
  videoOnJoin: boolean;
  backgroundEffects: boolean;
};

export type AppConfig = {
  videoSettings: VideoSettings;
  layoutMode: 'grid' | 'active-speaker';
};

export const defaultConfig: AppConfig = {
  videoSettings: {
    enableDisableCapableCamera: true,
    resolution: '1280x720',
    videoOnJoin: true,
    backgroundEffects: true,
  },
  layoutMode: 'active-speaker',
};

/**
 * Hook wrapper for application configuration. Provides application configuration including video
 * settings, layout preferences, etc. To configure settings, edit the
 * `vonage-video-react-app/config.json` file.
 * @returns {AppConfig} The application configuration
 */
const useConfig = (): AppConfig => {
  const mergedConfig: AppConfig = useMemo(() => {
    if (process.env.NODE_ENV === 'test') {
      return defaultConfig;
    }
    let typedConfigFile: Partial<AppConfig> = {};
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
      typedConfigFile = require('../../../../../config.json') as Partial<AppConfig>;
    } catch (_e) {
      // Fallback to defaultConfig if config.json is missing
      typedConfigFile = {};
    }
    return {
      ...defaultConfig,
      ...typedConfigFile,
      videoSettings: {
        ...defaultConfig.videoSettings,
        ...(typedConfigFile.videoSettings || {}),
      },
    };
  }, []);

  return mergedConfig;
};

export default useConfig;
