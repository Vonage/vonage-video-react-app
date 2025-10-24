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

class AppConfigStore extends Store<ConfigContextType> {
  constructor(initialState: AppConfig) {
    super({
      ...initialState,
      isLoaded: false,
    });
  }
}

export default AppConfigStore;
