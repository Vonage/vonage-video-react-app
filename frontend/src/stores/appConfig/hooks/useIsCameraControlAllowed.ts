import appConfigStore from '../appConfigStore';

const useIsCameraControlAllowed = appConfigStore.use.createSelectorHook(
  ({ isAppConfigLoaded, videoSettings }) => isAppConfigLoaded && videoSettings.allowCameraControl
);

export default useIsCameraControlAllowed;
