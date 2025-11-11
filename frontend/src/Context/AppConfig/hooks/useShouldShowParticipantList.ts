import appConfig from '../AppConfigContext';

const useShouldShowParticipantList = appConfig.use.createSelectorHook(
  ({ isAppConfigLoaded, meetingRoomSettings }) =>
    isAppConfigLoaded && meetingRoomSettings.showParticipantList
);

export default useShouldShowParticipantList;
