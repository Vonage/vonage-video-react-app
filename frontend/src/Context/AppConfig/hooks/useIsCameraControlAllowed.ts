import appConfig from '../AppConfigContext';

const useIsCameraControlAllowed = appConfig.use.createSelectorHook(
  ({ isAppConfigLoaded, videoSettings }) => isAppConfigLoaded && videoSettings.allowCameraControl
);

export default useIsCameraControlAllowed;
