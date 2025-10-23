import { useMemo, useEffect } from 'react';
import AppConfigStore, { AppConfig } from '../AppConfigStore';

export const defaultConfig: AppConfig = {
  videoSettings: {
    allowBackgroundEffects: true,
    allowCameraControl: true,
    allowVideoOnJoin: true,
    defaultResolution: '1280x720',
  },
  audioSettings: {
    allowAdvancedNoiseSuppression: true,
    allowAudioOnJoin: true,
    allowMicrophoneControl: true,
  },
  waitingRoomSettings: {
    allowDeviceSelection: true,
  },
  meetingRoomSettings: {
    allowArchiving: true,
    allowCaptions: true,
    allowChat: true,
    allowDeviceSelection: true,
    allowEmojis: true,
    allowScreenShare: true,
    defaultLayoutMode: 'active-speaker',
    showParticipantList: true,
  },
};

function useConfig(): AppConfigStore {
  const store = useMemo(() => new AppConfigStore(defaultConfig), []);

  useEffect(() => {
    // Try to load config from JSON file located at frontend/public/config.json
    const loadConfig = async () => {
      try {
        const response = await fetch('/config.json');

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.info('No valid JSON found, using default config');
          return;
        }

        const json = await response.json();

        store.setState({
          ...defaultConfig,
          isLoaded: true,
          videoSettings: {
            ...defaultConfig.videoSettings,
            ...(json.videoSettings || {}),
          },
          audioSettings: {
            ...defaultConfig.audioSettings,
            ...(json.audioSettings || {}),
          },
          waitingRoomSettings: {
            ...defaultConfig.waitingRoomSettings,
            ...(json.waitingRoomSettings || {}),
          },
          meetingRoomSettings: {
            ...defaultConfig.meetingRoomSettings,
            ...(json.meetingRoomSettings || {}),
          },
        });
      } catch (error) {
        console.error('Error loading config:', error);
      }
    };

    loadConfig();
  }, [store]);

  return store;
}

export default useConfig;
