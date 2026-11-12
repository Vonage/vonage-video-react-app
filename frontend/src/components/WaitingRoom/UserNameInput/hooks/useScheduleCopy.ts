import { useTranslation } from 'react-i18next';
import { serverSettings$ } from '@core/stores';
import { getFormattedDate, getFormattedTime } from '@utils/dateTime';
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

  const isStartToday = serverSettings$.use.select(
    (state) =>
      state.status !== 'pending' &&
      isToday({ timestamp: scheduleStatus.startsAtMs, now: state.now }),
    { dependencies: [scheduleStatus.startsAtMs] }
  );

  const dayText = isStartToday
    ? t('waitingRoom.schedule.today')
    : getFormattedDate(locale, scheduleStatus.startsAtMs);
  const startTimeText = getFormattedTime(locale, scheduleStatus.startsAtMs);
  const endTime = getFormattedTime(locale, scheduleStatus.endsAtMs);
  const endTimeText = t('waitingRoom.schedule.endTime', { time: endTime });

  if (scheduleStatus.kind === 'ended') {
    return {
      countdownText: null,
      headlineText: t('waitingRoom.schedule.ended'),
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
