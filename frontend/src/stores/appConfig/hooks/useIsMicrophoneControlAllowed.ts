import appConfigStore from '../appConfigStore';

const useIsMicrophoneControlAllowed = appConfigStore.use.createSelectorHook(
  ({ isAppConfigLoaded, audioSettings }) =>
    isAppConfigLoaded && audioSettings.allowMicrophoneControl
);

export default useIsMicrophoneControlAllowed;
