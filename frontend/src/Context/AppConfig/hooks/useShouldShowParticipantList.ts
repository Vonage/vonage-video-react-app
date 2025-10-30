import { useAppConfigContext } from '../AppConfigContext';

const useSelector = useAppConfigContext.createSelectorHook(
  ({ isAppConfigLoaded, meetingRoomSettings }) =>
    isAppConfigLoaded && meetingRoomSettings.showParticipantList
);

function useShouldShowParticipantList(): boolean {
  const [isAllowed] = useSelector();

  return isAllowed;
}

export default useShouldShowParticipantList;
