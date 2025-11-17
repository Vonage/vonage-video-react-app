import appConfig from '../AppConfigContext';

const useIsMicrophoneControlAllowed = appConfig.use.createSelectorHook(
  ({ isAppConfigLoaded, audioSettings }) =>
    isAppConfigLoaded && audioSettings.allowMicrophoneControl
);

export default useIsMicrophoneControlAllowed;
