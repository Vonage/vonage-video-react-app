import type { ComponentProps, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { twMerge } from 'tailwind-merge';
import { Collapsible } from '@ui/components';
import VividIcon from '@ui/components/VividIcon';
import useMeetingWhenLabel from '../../../hooks/useMeetingWhenLabel';
import type { SavedMeeting } from '../../../types/SavedMeeting';

export type CollapsibleMeetingRowProps = ComponentProps<'li'> & {
  meeting: SavedMeeting;
  nextUp: { minutesUntilStart: number } | null;
};

/**
 * Upcoming meeting as a borderless collapsible list item: essentials when collapsed, actions when expanded.
 */
const CollapsibleMeetingRow = ({
  meeting,
  nextUp,
  className,
  ...props
}: CollapsibleMeetingRowProps): ReactElement => {
  const { t } = useTranslation();
  const whenLabel = useMeetingWhenLabel(meeting.schedule);
  const isScheduled = meeting.schedule !== null;

  return (
    <li className={twMerge('border-b border-vera-border last:border-b-0', className)} {...props}>
      <Collapsible open={nextUp !== null} className="py-5 open:gap-5">
        <Collapsible.Summary className="gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-vera-medium bg-vera-background">
            <VividIcon
              name={isScheduled ? 'calendar-line' : 'infinity-line'}
              customSize={-5}
              style={{ color: 'var(--vera-text-primary)' }}
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            {nextUp && (
              <span className="flex items-center gap-1 font-vera-plain text-vera-caption-semibold text-vera-text-primary">
                <VividIcon
                  name="alarm-line"
                  customSize={-6}
                  style={{ color: 'var(--vera-text-primary)' }}
                />
                {t('meetingFlow.landing.nextUp')} ·{' '}
                {t('meetingFlow.landing.upcoming.startsIn', {
                  minutes: nextUp.minutesUntilStart,
                })}
              </span>
            )}
            <div className="flex min-w-0 flex-col gap-1">
              <span className="truncate font-vera-plain text-vera-body-base-semibold text-vera-text-secondary">
                {meeting.name ?? t('meetingFlow.common.untitledMeeting')}
              </span>
              <span className="truncate font-vera-plain text-vera-caption text-vera-text-tertiary">
                {whenLabel}
              </span>
            </div>
          </div>
          <Collapsible.Icon customSize={-5} style={{ color: 'var(--vera-text-tertiary)' }} />
        </Collapsible.Summary>
        <Collapsible.Details className="flex items-center gap-3 pl-13">
          <Button variant="contained" className="min-w-28!">
            {t('meetingFlow.common.join')}
          </Button>
          <Tooltip title={t('meetingFlow.landing.upcoming.share')}>
            <Button
              variant="outlined"
              aria-label={t('meetingFlow.landing.upcoming.share')}
              className="min-w-10! px-0!"
            >
              <VividIcon
                name="share-line"
                customSize={-5}
                style={{ color: 'var(--vera-primary)' }}
              />
            </Button>
          </Tooltip>
          {isScheduled && (
            <Tooltip title={t('meetingFlow.landing.upcoming.addToCalendar')}>
              <Button
                variant="outlined"
                aria-label={t('meetingFlow.landing.upcoming.addToCalendar')}
                className="min-w-10! px-0!"
              >
                <VividIcon
                  name="calendar-plus-line"
                  customSize={-5}
                  style={{ color: 'var(--vera-primary)' }}
                />
              </Button>
            </Tooltip>
          )}
        </Collapsible.Details>
      </Collapsible>
    </li>
  );
};

export default CollapsibleMeetingRow;
