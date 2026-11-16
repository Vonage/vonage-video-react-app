import { isNil } from '@common/assertions';
import { serverSettings$ } from '@core/stores';

const endingSoonSeconds = 5 * 60;

const useShouldShowMeetingTimer = (): boolean => {
  const { getSecondsUntilEnd } = serverSettings$.use.actions();

  return serverSettings$.use.select(function shouldShowMeetingTimer() {
    const secondsUntilEnd = getSecondsUntilEnd();
    if (isNil(secondsUntilEnd)) return false;

    return secondsUntilEnd <= endingSoonSeconds;
  });
};

export default useShouldShowMeetingTimer;
