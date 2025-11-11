import appConfig from '../AppConfigContext';

const useIsMeetingCaptionsAllowed = appConfig.use.createSelectorHook(
  ({ isAppConfigLoaded, meetingRoomSettings }) =>
    isAppConfigLoaded && meetingRoomSettings.allowCaptions
);

export default useIsMeetingCaptionsAllowed;
