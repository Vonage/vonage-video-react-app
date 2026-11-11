import type { ComponentProps, ReactElement } from 'react';
import { Skeleton } from '@mui/material';
import scheduleCountdownPanelVariants from './scheduleCountdownPanelVariants';

const ScheduleCountdownPanelSkeleton = ({
  className,
  ...props
}: ComponentProps<'div'>): ReactElement => {
  const { panel } = scheduleCountdownPanelVariants({ isStarted: false, isImminent: false });

  return (
    <div
      data-testid="schedule-countdown-panel-skeleton"
      className={panel({ className })}
      {...props}
    >
      <Skeleton
        variant="text"
        className="bg-vera-skeleton-like! font-vera-plain text-vera-caption-semibold w-1/4"
      />
      <Skeleton
        variant="text"
        className="bg-vera-skeleton-like! font-vera-plain text-vera-heading-3 w-1/2"
      />
      <Skeleton
        variant="text"
        className="bg-vera-skeleton-like! font-vera-plain text-vera-caption w-2/3"
      />
    </div>
  );
};

export default ScheduleCountdownPanelSkeleton;
