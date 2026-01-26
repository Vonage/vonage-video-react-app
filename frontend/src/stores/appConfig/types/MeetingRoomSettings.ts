import type { LayoutMode } from '@app-types/session';

type MeetingRoomSettings = {
  allowArchiving: boolean;
  allowCaptions: boolean;
  allowChat: boolean;
  allowDeviceSelection: boolean;
  allowEmojis: boolean;
  allowScreenShare: boolean;
  defaultLayoutMode: LayoutMode;
  showParticipantList: boolean;
};

export default MeetingRoomSettings;
