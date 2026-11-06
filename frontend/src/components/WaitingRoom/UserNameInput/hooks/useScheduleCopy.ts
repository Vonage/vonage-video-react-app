import { useTranslation } from 'react-i18next';
import formatMeetingDate from '../helpers/formatMeetingDate';
import getCountdownText from '../helpers/getCountdownText';
import type { ScheduledStatus } from '../types/ScheduleStatus';

export type ScheduleCopy = {
  countdownText: string | null;
  headlineText: string | null;
  detailText: string | null;
};

const useScheduleCopy = (scheduleStatus: ScheduledStatus): ScheduleCopy => {
  const { t, i18n } = useTranslation();

  const locale = i18n.language;

  if (scheduleStatus.kind === 'ended') {
    return {
      countdownText: null,
      headlineText: t('waitingRoom.schedule.ended', {
        time: formatMeetingDate({ timestamp: scheduleStatus.endsAt, locale, format: 'time' }),
      }),
      detailText: null,
    };
  }

  const timeRangeText = t('waitingRoom.schedule.timeRange', {
    start: formatMeetingDate({ timestamp: scheduleStatus.startsAt, locale, format: 'time' }),
    end: formatMeetingDate({ timestamp: scheduleStatus.endsAt, locale, format: 'time' }),
  });

  if (scheduleStatus.kind === 'started') {
    return {
      countdownText: null,
      headlineText: t('waitingRoom.schedule.started'),
      detailText: timeRangeText,
    };
  }

  const countdownText = getCountdownText({ waitingStatus: scheduleStatus, t });

  const detailText = (() => {
    if (scheduleStatus.kind === 'daysAway') {
      return t('waitingRoom.schedule.daysAway', {
        count: scheduleStatus.daysLeft,
        date: formatMeetingDate({ timestamp: scheduleStatus.startsAt, locale, format: 'dateTime' }),
      });
    }
    if (scheduleStatus.kind === 'withinDay') {
      return t('waitingRoom.schedule.withinDay', {
        time: formatMeetingDate({ timestamp: scheduleStatus.startsAt, locale, format: 'time' }),
        countdown: countdownText,
      });
    }
    return timeRangeText;
  })();

  return { countdownText, headlineText: null, detailText };
};

export default useScheduleCopy;
