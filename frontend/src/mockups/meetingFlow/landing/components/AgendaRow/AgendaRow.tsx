import type { ComponentProps, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { twMerge } from 'tailwind-merge';
import VividIcon from '@ui/components/VividIcon';
import formatMeetingDate from '../../../helpers/formatMeetingDate';
import useLocale from '../../../hooks/useLocale';
import type { SavedMeeting } from '../../../types/SavedMeeting';

const SOON_THRESHOLD_MINUTES = 60;

export type AgendaRowProps = ComponentProps<'li'> & {
  meeting: SavedMeeting;
  now: Date;
};

/**
 * Agenda entry: start time on the left, the meeting in the middle, the next action on the right.
 */
const AgendaRow = ({ meeting, now, className, ...props }: AgendaRowProps): ReactElement => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { schedule } = meeting;

  const minutesUntilStart = (() => {
    if (schedule === null) return null;
    return Math.round((schedule.startsAt.getTime() - now.getTime()) / 60_000);
  })();
  const isStartingSoon = minutesUntilStart !== null && minutesUntilStart <= SOON_THRESHOLD_MINUTES;

  return (
    <li
      className={twMerge(
        'flex items-center gap-4 rounded-vera-medium border border-vera-border bg-vera-surface p-3',
        className
      )}
      {...props}
    >
      <div className="flex w-18 shrink-0 flex-col">
        <span className="font-vera-plain text-vera-body-base-semibold text-vera-text-secondary">
          {schedule
            ? formatMeetingDate({ date: schedule.startsAt, locale, format: 'time' })
            : t('meetingFlow.landing.upcoming.anytime')}
        </span>
        <span className="font-vera-plain text-vera-caption text-vera-text-tertiary">
          {schedule
            ? t('meetingFlow.common.minutes', { count: schedule.durationMinutes })
            : t('meetingFlow.common.noSchedule')}
        </span>
      </div>
      <div className="h-10 w-1 shrink-0 rounded-full bg-vera-primary" />
      <span className="flex min-w-0 flex-1 items-center gap-2 truncate font-vera-plain text-vera-body-base-semibold text-vera-text-secondary">
        {meeting.name ?? t('meetingFlow.common.untitledMeeting')}
        {schedule && schedule.recurrence !== 'none' && (
          <VividIcon
            name="reload-line"
            customSize={-6}
            aria-label={t(`meetingFlow.recurrence.${schedule.recurrence}`)}
            style={{ color: 'var(--vera-text-tertiary)' }}
          />
        )}
      </span>
      {isStartingSoon ? (
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Button variant="contained" size="small">
            {t('meetingFlow.common.join')}
          </Button>
          <span className="font-vera-plain text-vera-caption text-vera-text-primary">
            {t('meetingFlow.landing.upcoming.startsIn', { minutes: minutesUntilStart })}
          </span>
        </div>
      ) : (
        <IconButton size="small" aria-label={t('meetingFlow.landing.upcoming.share')}>
          <VividIcon name="share-line" customSize={-5} />
        </IconButton>
      )}
    </li>
  );
};

export default AgendaRow;
