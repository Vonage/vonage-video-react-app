import type AudioSettings from './AudioSettings';
import type MeetingRoomSettings from './MeetingRoomSettings';
import type VideoSettings from './VideoSettings';
import type WaitingRoomSettings from './WaitingRoomSettings';

type AppConfig = {
  isAppConfigLoaded: boolean;

  videoSettings: VideoSettings;

  audioSettings: AudioSettings;

  waitingRoomSettings: WaitingRoomSettings;

  meetingRoomSettings: MeetingRoomSettings;
};

export default AppConfig;
