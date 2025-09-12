import { useMemo, useEffect, useState } from 'react';
import { LayoutMode } from '../../../types/session';

export type VideoSettings = {
  enableDisableCapableCamera: boolean;
  resolution: '1920x1080' | '1280x960' | '1280x720' | '640x480' | '640x360' | '320x240' | '320x180';
  videoOnJoin: boolean;
  backgroundEffects: boolean;
};

export type AudioSettings = {
  advancedNoiseSuppression: boolean;
  audioOnJoin: boolean;
  enableDisableCapableMicrophone: boolean;
};

export type WaitingRoomSettings = {
  allowDeviceSelection: boolean;
};

export type AppConfig = {
  videoSettings: VideoSettings;
  audioSettings: AudioSettings;
  waitingRoomSettings: WaitingRoomSettings;
  layoutMode: LayoutMode;
};

export const defaultConfig: AppConfig = {
  videoSettings: {
    enableDisableCapableCamera: true,
    resolution: '1280x720',
    videoOnJoin: true,
    backgroundEffects: true,
  },
  audioSettings: {
    advancedNoiseSuppression: true,
    audioOnJoin: true,
    enableDisableCapableMicrophone: true,
  },
  waitingRoomSettings: {
    allowDeviceSelection: true,
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
  const [config, setConfig] = useState<AppConfig>(defaultConfig);

  useEffect(() => {
    // Try to load config from JSON file located at src/public/config.json
    const loadConfig = async () => {
      try {
        const response = await fetch('/config.json');
        const json = await response.json();
        setConfig(json);
      } catch (error) {
        console.info('Error loading config:', error);
      }
    };

    loadConfig();
  }, []);

  const mergedConfig: AppConfig = useMemo(() => {
    const typedConfigFile = config as Partial<AppConfig>;

    return {
      ...defaultConfig,
      ...typedConfigFile,
      videoSettings: {
        ...defaultConfig.videoSettings,
        ...(typedConfigFile.videoSettings || {}),
      },
    };
  }, [config]);

  return mergedConfig;
};

export default useConfig;
