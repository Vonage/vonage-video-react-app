import appConfig$ from '../AppConfigStore';

const useIsMicrophoneControlAllowed = appConfig$.use.createSelectorHook(
  ({ isAppConfigLoaded, audioSettings }) =>
    isAppConfigLoaded && audioSettings.allowMicrophoneControl
);

export default useIsMicrophoneControlAllowed;
