import { useAppConfigContext } from '../AppConfigContext';

const useSelector = useAppConfigContext.createSelectorHook(
  ({ isAppConfigLoaded, meetingRoomSettings }) =>
    isAppConfigLoaded && meetingRoomSettings.allowCaptions
);

function useIsMeetingCaptionsAllowed(): boolean {
  const [isAllowed] = useSelector();

  return isAllowed;
}

export default useIsMeetingCaptionsAllowed;
