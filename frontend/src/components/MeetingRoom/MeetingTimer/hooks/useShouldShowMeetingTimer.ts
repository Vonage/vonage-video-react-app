import { isNil } from '@common/assertions';
import { serverSettings$ } from '@core/stores';

const endingSoonSeconds = 5 * 60;

const useShouldShowMeetingTimer = (): boolean => {
  return serverSettings$.use.select(function shouldShowMeetingTimer(state) {
    const secondsUntilEnd = serverSettings$.selectors.secondsUntilEnd(state);
    if (isNil(secondsUntilEnd)) return false;

    return secondsUntilEnd <= endingSoonSeconds;
  });
};

export default useShouldShowMeetingTimer;
