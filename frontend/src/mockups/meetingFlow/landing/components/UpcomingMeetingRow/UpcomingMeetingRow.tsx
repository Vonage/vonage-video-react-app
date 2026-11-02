import type { ComponentProps, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { twMerge } from 'tailwind-merge';
import VividIcon from '@ui/components/VividIcon';
import useMeetingWhenLabel from '../../../hooks/useMeetingWhenLabel';
import type { SavedMeeting } from '../../../types/SavedMeeting';

export type UpcomingMeetingRowProps = ComponentProps<'li'> & {
  meeting: SavedMeeting;
};

/**
 * One saved meeting in a list: icon tile, name, when, number of extra roles and quick actions.
 */
const UpcomingMeetingRow = ({
  meeting,
  className,
  ...props
}: UpcomingMeetingRowProps): ReactElement => {
  const { t } = useTranslation();
  const whenLabel = useMeetingWhenLabel(meeting.schedule);
  const isScheduled = meeting.schedule !== null;

  return (
    <li
      className={twMerge(
        'flex items-center gap-3 rounded-vera-medium px-2 py-3 hover:bg-vera-background',
        className
      )}
      {...props}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-vera-medium bg-vera-background">
        <VividIcon
          name={isScheduled ? 'calendar-line' : 'infinity-line'}
          customSize={-5}
          style={{ color: 'var(--vera-text-primary)' }}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-vera-plain text-vera-body-base-semibold text-vera-text-secondary">
          {meeting.name ?? t('meetingFlow.common.untitledMeeting')}
        </span>
        <span className="truncate font-vera-plain text-vera-caption text-vera-text-tertiary">
          {whenLabel}
        </span>
      </div>
      <Tooltip title={t('meetingFlow.landing.upcoming.share')}>
        <IconButton size="small" aria-label={t('meetingFlow.landing.upcoming.share')}>
          <VividIcon name="share-line" customSize={-5} />
        </IconButton>
      </Tooltip>
      <IconButton size="small" aria-label={t('meetingFlow.common.more')}>
        <VividIcon name="more-vertical-solid" customSize={-5} />
      </IconButton>
    </li>
  );
};

export default UpcomingMeetingRow;
