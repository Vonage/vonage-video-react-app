import appConfigStore from '../appConfigStore';

const useShouldShowParticipantList = appConfigStore.use.createSelectorHook(
  ({ isAppConfigLoaded, meetingRoomSettings }) =>
    isAppConfigLoaded && meetingRoomSettings.showParticipantList
);

export default useShouldShowParticipantList;
