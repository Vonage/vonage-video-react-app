import useConfigContext from '@hooks/useConfigContext';

const useIsMicrophoneControlAllowed = () => {
  return useConfigContext(
    ({ audioSettings, isLoaded: isAppConfigLoaded }) =>
      isAppConfigLoaded && audioSettings.allowMicrophoneControl
  );
};

export default useIsMicrophoneControlAllowed;
