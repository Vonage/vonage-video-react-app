import { useTranslation } from 'react-i18next';
import formatMeetingDate from '../helpers/formatMeetingDate';
import getCountdownText from '../helpers/getCountdownText';
import isToday from '../helpers/isToday';
import type { ScheduledStatus } from '../types/ScheduleStatus';

export type ScheduleCopy = {
  countdownText: string | null;
  headlineText: string | null;
  dayText: string;
  startTimeText: string;
  endTimeText: string;
};

const useScheduleCopy = (scheduleStatus: ScheduledStatus): ScheduleCopy => {
  const { t, i18n } = useTranslation();

  const locale = i18n.language;

  const dayText = isToday(scheduleStatus.startsAtMs)
    ? t('waitingRoom.schedule.today')
    : formatMeetingDate({ timestamp: scheduleStatus.startsAtMs, locale, format: 'date' });
  const startTimeText = formatMeetingDate({
    timestamp: scheduleStatus.startsAtMs,
    locale,
    format: 'time',
  });
  const endTime = formatMeetingDate({ timestamp: scheduleStatus.endsAtMs, locale, format: 'time' });
  const endTimeText = t('waitingRoom.schedule.endTime', { time: endTime });

  if (scheduleStatus.kind === 'ended') {
    return {
      countdownText: null,
      headlineText: t('waitingRoom.schedule.ended', { time: endTime }),
      dayText,
      startTimeText,
      endTimeText,
    };
  }

  if (scheduleStatus.kind === 'started') {
    return {
      countdownText: null,
      headlineText: t('waitingRoom.schedule.started'),
      dayText,
      startTimeText,
      endTimeText,
    };
  }

  return {
    countdownText: getCountdownText({ waitingStatus: scheduleStatus, t }),
    headlineText: null,
    dayText,
    startTimeText,
    endTimeText,
  };
};

export default useScheduleCopy;
