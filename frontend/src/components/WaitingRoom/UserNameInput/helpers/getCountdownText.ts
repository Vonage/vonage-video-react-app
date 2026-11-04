import type { TFunction } from 'i18next';
import type { WaitingStatus } from '../types/ScheduleStatus';
import formatCountdown from './formatCountdown';

/**
 * Time left until a waiting meeting starts, at the precision its state calls for.
 */
function getCountdownText({ waitingStatus, t }: { waitingStatus: WaitingStatus; t: TFunction }) {
  if (waitingStatus.kind === 'daysAway') {
    return t('waitingRoom.schedule.countdown.days', { count: waitingStatus.daysLeft });
  }
  if (waitingStatus.kind === 'withinDay') {
    return t('waitingRoom.schedule.countdown.hoursAndMinutes', {
      hours: Math.floor(waitingStatus.minutesLeft / 60),
      minutes: waitingStatus.minutesLeft % 60,
    });
  }
  if (waitingStatus.kind === 'withinHour') {
    return t('waitingRoom.schedule.countdown.minutes', { minutes: waitingStatus.minutesLeft });
  }
  return formatCountdown(waitingStatus.secondsLeft);
}

export default getCountdownText;
