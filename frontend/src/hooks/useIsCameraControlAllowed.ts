import useConfigContext from '@hooks/useConfigContext';

const useIsCameraControlAllowed = () => {
  return useConfigContext(
    ({ videoSettings, isLoaded: isAppConfigLoaded }) =>
      isAppConfigLoaded && videoSettings.allowCameraControl
  );
};

export default useIsCameraControlAllowed;
