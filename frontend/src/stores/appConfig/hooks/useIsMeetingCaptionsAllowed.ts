import appConfigStore from '../appConfigStore';

const useIsMeetingCaptionsAllowed = appConfigStore.use.createSelectorHook(
  ({ isAppConfigLoaded, meetingRoomSettings }) =>
    isAppConfigLoaded && meetingRoomSettings.allowCaptions
);

export default useIsMeetingCaptionsAllowed;
