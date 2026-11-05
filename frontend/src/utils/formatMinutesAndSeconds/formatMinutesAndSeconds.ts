import type { TFunction } from 'i18next';

/**
 * Formats a number of seconds as labelled minutes and seconds, for example `4 min 52 sec`.
 */
function formatMinutesAndSeconds({ totalSeconds, t }: { totalSeconds: number; t: TFunction }) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) {
    return t('waitingRoom.schedule.countdown.seconds', { seconds });
  }
  if (seconds === 0) {
    return t('waitingRoom.schedule.countdown.minutes', { minutes });
  }
  return t('waitingRoom.schedule.countdown.minutesAndSeconds', { minutes, seconds });
}

export default formatMinutesAndSeconds;
