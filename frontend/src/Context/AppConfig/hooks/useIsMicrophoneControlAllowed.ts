import { useAppConfigContext } from '../AppConfigContext';

const useSelector = useAppConfigContext.createSelectorHook(
  ({ isAppConfigLoaded, audioSettings }) =>
    isAppConfigLoaded && audioSettings.allowMicrophoneControl
);

function useIsMicrophoneControlAllowed(): boolean {
  const [isAllowed] = useSelector();

  return isAllowed;
}

export default useIsMicrophoneControlAllowed;
