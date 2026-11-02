import { useTranslation } from 'react-i18next';
import formatCountdown from '../../helpers/formatCountdown';
import formatMeetingDate from '../../helpers/formatMeetingDate';
import useLocale from '../../hooks/useLocale';
import type { ScheduleStatus } from '../../types/ScheduleStatus';
import useScheduleStatus from './useScheduleStatus';

export type ScheduleCopy = {
  status: ScheduleStatus;
  statusText: string;
  countdownText: string | null;
  joinLabel: string;
  timeRange: string | null;
  isJoinEnabled: boolean;
  isWaiting: boolean;
};

/**
 * All the words the waiting-room card needs for the current schedule state.
 */
const useScheduleCopy = (): ScheduleCopy => {
  const { t } = useTranslation();
  const locale = useLocale();
  const status = useScheduleStatus();

  const formatTime = (date: Date) => formatMeetingDate({ date, locale, format: 'time' });
  const formatDateTime = (date: Date) => formatMeetingDate({ date, locale, format: 'dateTime' });

  const timeRange = (() => {
    if (status.kind === 'unscheduled' || status.kind === 'ended') return null;
    return t('meetingFlow.waitingRoom.status.timeRange', {
      start: formatTime(status.startsAt),
      end: formatTime(status.endsAt),
    });
  })();

  const statusText = (() => {
    if (status.kind === 'unscheduled') return t('meetingFlow.waitingRoom.status.unscheduled');
    if (status.kind === 'started') return t('meetingFlow.waitingRoom.status.started');
    if (status.kind === 'ended') {
      return t('meetingFlow.waitingRoom.status.ended', { time: formatTime(status.endsAt) });
    }
    if (status.isRecurring && (status.kind === 'daysAway' || status.kind === 'withinDay')) {
      return t('meetingFlow.waitingRoom.status.nextOccurrence', {
        date: formatDateTime(status.startsAt),
      });
    }
    if (status.kind === 'daysAway') {
      return t('meetingFlow.waitingRoom.status.daysAway', {
        count: status.daysLeft,
        date: formatDateTime(status.startsAt),
      });
    }
    if (status.kind === 'withinDay') {
      return t('meetingFlow.waitingRoom.status.withinDay', {
        time: formatTime(status.startsAt),
        hours: Math.floor(status.minutesLeft / 60),
        minutes: status.minutesLeft % 60,
      });
    }
    if (status.kind === 'withinHour') {
      return t('meetingFlow.waitingRoom.status.withinHour', { count: status.minutesLeft });
    }
    return t('meetingFlow.waitingRoom.status.withinFiveMinutes', {
      countdown: formatCountdown(status.secondsLeft),
    });
  })();

  const countdownText = (() => {
    if (status.kind === 'daysAway')
      return t('meetingFlow.waitingRoom.countdown.days', { count: status.daysLeft });
    if (status.kind === 'withinDay') {
      return t('meetingFlow.waitingRoom.countdown.hours', {
        hours: Math.floor(status.minutesLeft / 60),
        minutes: status.minutesLeft % 60,
      });
    }
    if (status.kind === 'withinHour')
      return t('meetingFlow.common.minutes', { count: status.minutesLeft });
    if (status.kind === 'withinFiveMinutes') return formatCountdown(status.secondsLeft);
    return null;
  })();

  const joinLabel = (() => {
    if (status.kind === 'unscheduled' || status.kind === 'started') return t('button.join');
    if (status.kind === 'ended') return t('meetingFlow.waitingRoom.meetingEnded');
    if (status.kind === 'withinFiveMinutes') {
      return t('meetingFlow.waitingRoom.joinOpensIn', {
        countdown: formatCountdown(status.secondsLeft),
      });
    }
    if (status.kind === 'withinHour') {
      return t('meetingFlow.waitingRoom.joinOpensIn', { countdown: countdownText });
    }
    if (status.kind === 'withinDay') {
      return t('meetingFlow.waitingRoom.joinOpensAt', { time: formatTime(status.startsAt) });
    }
    return t('meetingFlow.waitingRoom.joinOpensOn', {
      date: formatMeetingDate({ date: status.startsAt, locale, format: 'date' }),
    });
  })();

  const isJoinEnabled = status.kind === 'unscheduled' || status.kind === 'started';
  const isWaiting = !isJoinEnabled && status.kind !== 'ended';

  return { status, statusText, countdownText, joinLabel, timeRange, isJoinEnabled, isWaiting };
};

export default useScheduleCopy;
