import type { ComponentProps, ReactElement, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { twMerge } from 'tailwind-merge';
import VividIcon from '@ui/components/VividIcon';
import formatMeetingDate from '../../../helpers/formatMeetingDate';
import useLocale from '../../../hooks/useLocale';
import meetings$ from '../../../stores/meetingsStore';
import type { SavedMeeting } from '../../../types/SavedMeeting';

export type ArchivedMeetingRowProps = Omit<ComponentProps<'li'>, 'children'> & {
  meeting: SavedMeeting;
  leading?: ReactNode;
};

/**
 * Archived meeting entry with Restore and Delete actions. `leading` can hold a selection checkbox.
 */
const ArchivedMeetingRow = ({
  meeting,
  leading,
  className,
  ...props
}: ArchivedMeetingRowProps): ReactElement => {
  const { t } = useTranslation();
  const locale = useLocale();

  const dateLabel = (() => {
    if (meeting.schedule === null) {
      const date = formatMeetingDate({ date: meeting.createdAt, locale, format: 'date' });
      return t('meetingFlow.archive.created', { date });
    }
    const date = formatMeetingDate({ date: meeting.schedule.startsAt, locale, format: 'date' });
    return t('meetingFlow.archive.ended', { date });
  })();

  return (
    <li
      className={twMerge(
        'flex items-center gap-3 border-b border-vera-border py-3 last:border-b-0',
        className
      )}
      {...props}
    >
      {leading}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-vera-plain text-vera-body-base-semibold text-vera-text-secondary">
          {meeting.name ?? t('meetingFlow.common.untitledMeeting')}
        </span>
        <span className="truncate font-vera-plain text-vera-caption text-vera-text-tertiary">
          {dateLabel}
        </span>
      </div>
      <Button variant="text" size="small" onClick={() => meetings$.actions.restore(meeting.id)}>
        {t('meetingFlow.archive.restore')}
      </Button>
      <IconButton size="small" aria-label={t('meetingFlow.archive.delete')}>
        <VividIcon name="delete-line" customSize={-5} style={{ color: 'var(--vera-error)' }} />
      </IconButton>
    </li>
  );
};

export default ArchivedMeetingRow;
