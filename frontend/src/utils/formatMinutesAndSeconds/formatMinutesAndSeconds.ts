import type { TFunction } from 'i18next';

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
