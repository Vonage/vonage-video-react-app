import type { TFunction } from 'i18next';
import { formatCountdown } from '@common/helpers';

const secondsCountdownThreshold = 10 * 60;

/**
 * Time left in the meeting: hours and minutes, minutes, then `m:ss` in the last ten minutes.
 */
function getTimeLeftText({ secondsLeft, t }: { secondsLeft: number; t: TFunction }): string {
  if (secondsLeft < secondsCountdownThreshold) return formatCountdown(secondsLeft);

  const minutesLeft = Math.floor(secondsLeft / 60);
  if (minutesLeft < 60) return t('meetingTimer.minutes', { minutes: minutesLeft });

  return t('meetingTimer.hoursAndMinutes', {
    hours: Math.floor(minutesLeft / 60),
    minutes: minutesLeft % 60,
  });
}

export default getTimeLeftText;
