import appConfig$ from '../AppConfigStore';

const useIsMeetingChatAllowed = appConfig$.use.createSelectorHook(
  ({ isAppConfigLoaded, meetingRoomSettings }) => isAppConfigLoaded && meetingRoomSettings.allowChat
);

export default useIsMeetingChatAllowed;
