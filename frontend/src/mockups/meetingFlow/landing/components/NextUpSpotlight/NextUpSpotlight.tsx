import type { ComponentProps, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import { twMerge } from 'tailwind-merge';
import VividIcon from '@ui/components/VividIcon';
import RoleBadge from '../../../components/RoleBadge';
import useMeetingWhenLabel from '../../../hooks/useMeetingWhenLabel';
import type { SavedMeeting } from '../../../types/SavedMeeting';

export type NextUpSpotlightProps = ComponentProps<'section'> & {
  meeting: SavedMeeting;
  minutesUntilStart: number;
};

/**
 * Highlighted tile for the soonest meeting, with direct Join and Share actions.
 */
const NextUpSpotlight = ({
  meeting,
  minutesUntilStart,
  className,
  ...props
}: NextUpSpotlightProps): ReactElement => {
  const { t } = useTranslation();
  const whenLabel = useMeetingWhenLabel(meeting.schedule);

  return (
    <section
      className={twMerge(
        'flex w-full flex-col gap-3 rounded-vera-large border border-vera-primary bg-vera-surface p-4',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <VividIcon
          name="alarm-line"
          customSize={-5}
          style={{ color: 'var(--vera-text-primary)' }}
        />
        <span className="font-vera-plain text-vera-caption-semibold text-vera-text-primary">
          {t('meetingFlow.landing.nextUp')} ·{' '}
          {t('meetingFlow.landing.upcoming.startsIn', { minutes: minutesUntilStart })}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="font-vera-plain text-vera-body-extended-semibold text-vera-text-secondary">
          {meeting.name ?? t('meetingFlow.common.untitledMeeting')}
        </span>
        <span className="font-vera-plain text-vera-body-base text-vera-text-tertiary">
          {whenLabel}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {meeting.links.map(({ role }) => (
          <RoleBadge key={role} meetingRole={role} />
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="contained" className="flex-1">
          {t('meetingFlow.landing.nextUp.join')}
        </Button>
        <Button
          variant="outlined"
          className="flex-1"
          startIcon={
            <VividIcon name="share-line" customSize={-5} style={{ color: 'var(--vera-primary)' }} />
          }
        >
          {t('meetingFlow.landing.upcoming.share')}
        </Button>
      </div>
    </section>
  );
};

export default NextUpSpotlight;
