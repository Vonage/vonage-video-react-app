import { useMemo, useEffect, useState } from 'react';
import { LayoutMode } from '../../../types/session';

export type VideoSettings = {
  allowBackgroundEffects: boolean;
  allowCameraControl: boolean;
  allowVideoOnJoin: boolean;
  defaultResolution:
    | '1920x1080'
    | '1280x960'
    | '1280x720'
    | '640x480'
    | '640x360'
    | '320x240'
    | '320x180';
};

export type AudioSettings = {
  allowAdvancedNoiseSuppression: boolean;
  allowAudioOnJoin: boolean;
  allowMicrophoneControl: boolean;
};

export type WaitingRoomSettings = {
  allowDeviceSelection: boolean;
};

export type MeetingRoomSettings = {
  allowDeviceSelection: boolean;
  defaultLayoutMode: LayoutMode;
  showArchiveButton: boolean;
  showCaptionsButton: boolean;
  showChatButton: boolean;
  showEmojiButton: boolean;
  showParticipantList: boolean;
  showScreenShareButton: boolean;
};

export type AppConfig = {
  videoSettings: VideoSettings;
  audioSettings: AudioSettings;
  waitingRoomSettings: WaitingRoomSettings;
  meetingRoomSettings: MeetingRoomSettings;
};

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
    allowDeviceSelection: true,
    defaultLayoutMode: 'active-speaker',
    showParticipantList: true,
    showChatButton: true,
    showScreenShareButton: true,
    showArchiveButton: true,
    showCaptionsButton: true,
    showEmojiButton: true,
  },
};

/**
 * Hook wrapper for application configuration. Provides comprehensive application configuration
 * including video settings (background effects, camera control, resolution), audio settings
 * (noise suppression, microphone control), waiting room settings (device selection), and
 * meeting room settings (layout mode, UI button visibility). To configure settings, edit the
 * `vonage-video-react-app/public/config.json` file.
 * @returns {AppConfig} The application configuration with video, audio, waiting room, and meeting room settings
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
      audioSettings: {
        ...defaultConfig.audioSettings,
        ...(typedConfigFile.audioSettings || {}),
      },
      waitingRoomSettings: {
        ...defaultConfig.waitingRoomSettings,
        ...(typedConfigFile.waitingRoomSettings || {}),
      },
      meetingRoomSettings: {
        ...defaultConfig.meetingRoomSettings,
        ...(typedConfigFile.meetingRoomSettings || {}),
      },
    };
  }, [config]);

  return mergedConfig;
};

export default useConfig;
