import appConfig$ from '../AppConfigStore';

const useIsMeetingCaptionsAllowed = appConfig$.use.createSelectorHook(
  ({ isAppConfigLoaded, meetingRoomSettings }) =>
    isAppConfigLoaded && meetingRoomSettings.allowCaptions
);

export default useIsMeetingCaptionsAllowed;
