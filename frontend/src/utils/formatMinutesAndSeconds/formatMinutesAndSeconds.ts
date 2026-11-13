import type { TFunction } from 'i18next';

function formatMinutesAndSeconds({ totalSeconds, t }: { totalSeconds: number; t: TFunction }) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) {
    return t('duration.format.seconds', { seconds });
  }
  if (seconds === 0) {
    return t('duration.format.minutes', { minutes });
  }
  return t('duration.format.minutesAndSeconds', { minutes, seconds });
}

export default formatMinutesAndSeconds;
