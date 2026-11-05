import type { TFunction } from 'i18next';
import type { WaitingStatus } from '../types/ScheduleStatus';

function getCountdownText({ waitingStatus, t }: { waitingStatus: WaitingStatus; t: TFunction }) {
  if (waitingStatus.kind === 'daysAway') {
    return t('waitingRoom.schedule.countdown.days', { count: waitingStatus.daysLeft });
  }
  if (waitingStatus.kind === 'withinDay') {
    const hours = Math.floor(waitingStatus.minutesLeft / 60);
    const minutes = waitingStatus.minutesLeft % 60;
    if (minutes === 0) {
      return t('waitingRoom.schedule.countdown.hours', { hours });
    }
    return t('waitingRoom.schedule.countdown.hoursAndMinutes', { hours, minutes });
  }
  if (waitingStatus.kind === 'withinHour') {
    return t('waitingRoom.schedule.countdown.minutes', { minutes: waitingStatus.minutesLeft });
  }
  const minutes = Math.floor(waitingStatus.secondsLeft / 60);
  const seconds = waitingStatus.secondsLeft % 60;
  if (minutes === 0) {
    return t('waitingRoom.schedule.countdown.seconds', { seconds });
  }
  if (seconds === 0) {
    return t('waitingRoom.schedule.countdown.minutes', { minutes });
  }
  return t('waitingRoom.schedule.countdown.minutesAndSeconds', { minutes, seconds });
}

export default getCountdownText;
