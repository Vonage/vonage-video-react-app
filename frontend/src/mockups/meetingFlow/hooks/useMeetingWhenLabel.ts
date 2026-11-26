import { useTranslation } from 'react-i18next';
import formatMeetingDate from '../helpers/formatMeetingDate';
import type { MeetingSchedule } from '../types/MeetingSchedule';
import useLocale from './useLocale';

/**
 * Builds the one-line "when" summary of a meeting, for example "Tue, Nov 3, 9:30 AM · 30 min · Weekly".
 */
const useMeetingWhenLabel = (schedule: MeetingSchedule | null): string => {
  const { t } = useTranslation();
  const locale = useLocale();

  if (schedule === null) return t('meetingFlow.common.noSchedule');

  const parts = [
    formatMeetingDate({ date: schedule.startsAt, locale, format: 'dateTime' }),
    t('meetingFlow.common.minutes', { count: schedule.durationMinutes }),
  ];

  if (schedule.recurrence !== 'none') {
    parts.push(t(`meetingFlow.recurrence.short.${schedule.recurrence}`));
  }

  return parts.join(' · ');
};

export default useMeetingWhenLabel;
