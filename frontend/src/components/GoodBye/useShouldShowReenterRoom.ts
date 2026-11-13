import useSessionKeyParam from '@hooks/useSessionKeyParam';
import { isNil } from '@common/assertions';
import { serverSettings$ } from '@core/stores';

const useShouldShowReenterRoom = (): boolean => {
  const { sessionKey } = useSessionKeyParam();
  const { getSecondsUntilEnd } = serverSettings$.use.actions();
  const hasSessionKey = Boolean(sessionKey);

  return serverSettings$.use.select(
    function shouldShowReenterRoom(state) {
      if (!hasSessionKey) return false;
      if (isNil(state.scheduleWindow)) return true;

      const secondsUntilEnd = getSecondsUntilEnd();
      if (isNil(secondsUntilEnd)) return false;

      const hasMeetingEnded = secondsUntilEnd === 0;
      return !hasMeetingEnded;
    },
    { dependencies: [hasSessionKey] }
  );
};

export default useShouldShowReenterRoom;
