import { DeepPartial } from '@app-types/index';
import type { LayoutMode } from '@app-types/session';
import Store from '@Context/helpers/Store';

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
  allowArchiving: boolean;
  allowCaptions: boolean;
  allowChat: boolean;
  allowDeviceSelection: boolean;
  allowEmojis: boolean;
  allowScreenShare: boolean;
  defaultLayoutMode: LayoutMode;
  showParticipantList: boolean;
};

export type AppConfig = {
  videoSettings: VideoSettings;

  audioSettings: AudioSettings;

  waitingRoomSettings: WaitingRoomSettings;

  meetingRoomSettings: MeetingRoomSettings;
};

export type ConfigContextType = AppConfig & {
  isLoaded: boolean;
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

class AppConfigStore extends Store<ConfigContextType> {
  constructor(initialState: DeepPartial<ConfigContextType>) {
    super({
      ...mergeAppConfigs({ previous: defaultConfig, updates: initialState }),
      isLoaded: false,
    });
  }
}

export function mergeAppConfigs({
  previous,
  updates,
}: {
  previous: AppConfig;
  updates: DeepPartial<AppConfig>;
}): AppConfig {
  return {
    ...previous,
    videoSettings: {
      ...previous.videoSettings,
      ...(updates.videoSettings || {}),
    },
    audioSettings: {
      ...previous.audioSettings,
      ...(updates.audioSettings || {}),
    },
    waitingRoomSettings: {
      ...previous.waitingRoomSettings,
      ...(updates.waitingRoomSettings || {}),
    },
    meetingRoomSettings: {
      ...previous.meetingRoomSettings,
      ...(updates.meetingRoomSettings || {}),
    },
  };
}

export default AppConfigStore;
