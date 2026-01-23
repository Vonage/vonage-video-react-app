import appConfig$ from '../AppConfigStore';

const useIsCameraControlAllowed = appConfig$.use.createSelectorHook(
  ({ isAppConfigLoaded, videoSettings }) => isAppConfigLoaded && videoSettings.allowCameraControl
);

export default useIsCameraControlAllowed;
