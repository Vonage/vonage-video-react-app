import { useAppConfigContext } from '../AppConfigContext';

const useSelector = useAppConfigContext.createSelectorHook(
  ({ isAppConfigLoaded, meetingRoomSettings }) => isAppConfigLoaded && meetingRoomSettings.allowChat
);

function useIsMeetingChatAllowed(): boolean {
  const [isAllowed] = useSelector();

  return isAllowed;
}

export default useIsMeetingChatAllowed;
