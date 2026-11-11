import type { ComponentProps, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';
import VividIcon from '@ui/components/VividIcon';
import formatMeetingDate from '../../../helpers/formatMeetingDate';
import useLocale from '../../../hooks/useLocale';
import type { SavedMeeting } from '../../../types/SavedMeeting';

export type CompactMeetingRowProps = ComponentProps<'li'> & {
  meeting: SavedMeeting;
};

/**
 * Single-line meeting entry: name on the left, start date on the right.
 */
const CompactMeetingRow = ({
  meeting,
  className,
  ...props
}: CompactMeetingRowProps): ReactElement => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { schedule } = meeting;

  return (
    <li
      className={twMerge(
        'flex items-center gap-3 border-b border-vera-border py-3 last:border-b-0',
        className
      )}
      {...props}
    >
      <span className="min-w-0 flex-1 truncate font-vera-plain text-vera-body-base text-vera-text-secondary">
        {meeting.name ?? t('meetingFlow.common.untitledMeeting')}
      </span>
      {schedule && schedule.recurrence !== 'none' && (
        <VividIcon
          name="reload-line"
          customSize={-6}
          style={{ color: 'var(--vera-text-tertiary)' }}
        />
      )}
      <span className="shrink-0 font-vera-plain text-vera-caption text-vera-text-tertiary">
        {schedule
          ? formatMeetingDate({ date: schedule.startsAt, locale, format: 'dateTime' })
          : t('meetingFlow.common.noSchedule')}
      </span>
      <VividIcon
        name="chevron-right-line"
        customSize={-6}
        style={{ color: 'var(--vera-text-tertiary)' }}
      />
    </li>
  );
};

export default CompactMeetingRow;
