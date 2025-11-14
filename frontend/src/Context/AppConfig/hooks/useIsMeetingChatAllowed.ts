import appConfig from '../AppConfigContext';

const useIsMeetingChatAllowed = appConfig.use.createSelectorHook(
  ({ isAppConfigLoaded, meetingRoomSettings }) => isAppConfigLoaded && meetingRoomSettings.allowChat
);

export default useIsMeetingChatAllowed;
