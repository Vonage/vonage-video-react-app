import type { TFunction } from 'i18next';
import formatMinutesAndSeconds from '@utils/formatMinutesAndSeconds';
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
    return t('duration.format.minutes', { minutes: waitingStatus.minutesLeft });
  }
  return formatMinutesAndSeconds({ totalSeconds: waitingStatus.secondsLeft, t });
}

export default getCountdownText;
