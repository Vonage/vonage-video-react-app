import { useAppConfigContext } from '../AppConfigContext';

const useSelector = useAppConfigContext.createSelectorHook(
  ({ isAppConfigLoaded, videoSettings }) => isAppConfigLoaded && videoSettings.allowCameraControl
);

function useIsCameraControlAllowed(): boolean {
  const [isAllowed] = useSelector();

  return isAllowed;
}

export default useIsCameraControlAllowed;
