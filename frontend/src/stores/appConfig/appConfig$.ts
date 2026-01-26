import store from './appConfigStore';

import {
  useIsBackgroundEffectsAllowed,
  useIsCameraControlAllowed,
  useIsMeetingCaptionsAllowed,
  useIsMeetingChatAllowed,
  useIsMicrophoneControlAllowed,
  useShouldShowParticipantList,
  useSuspenseUntilAppConfigReady,
} from './hooks';

const appConfig$ = Object.assign(store, {
  useIsBackgroundEffectsAllowed,
  useIsCameraControlAllowed,
  useIsMeetingCaptionsAllowed,
  useIsMeetingChatAllowed,
  useIsMicrophoneControlAllowed,
  useShouldShowParticipantList,
  useSuspenseUntilAppConfigReady,
});

export default appConfig$;
