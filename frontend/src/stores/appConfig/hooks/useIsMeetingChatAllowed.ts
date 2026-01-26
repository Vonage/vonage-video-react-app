import appConfigStore from '../appConfigStore';

const useIsMeetingChatAllowed = appConfigStore.use.createSelectorHook(
  ({ isAppConfigLoaded, meetingRoomSettings }) => isAppConfigLoaded && meetingRoomSettings.allowChat
);

export default useIsMeetingChatAllowed;
