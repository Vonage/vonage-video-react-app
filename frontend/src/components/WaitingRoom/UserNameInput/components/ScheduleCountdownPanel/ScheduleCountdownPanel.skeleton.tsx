import type { ComponentProps, ReactElement } from 'react';
import { Skeleton } from '@mui/material';
import scheduleCountdownPanelVariants from './scheduleCountdownPanelVariants';

const ScheduleCountdownPanelSkeleton = ({
  className,
  ...props
}: ComponentProps<'div'>): ReactElement => {
  const { panel, column, divider } = scheduleCountdownPanelVariants({
    isStarted: false,
    isImminent: false,
  });

  return (
    <div
      data-testid="schedule-countdown-panel-skeleton"
      className={panel({ className })}
      {...props}
    >
      <div className={column()}>
        <Skeleton
          variant="text"
          className="bg-vera-skeleton-like! font-vera-plain text-vera-caption-semibold w-1/2"
        />
        <Skeleton
          variant="text"
          className="bg-vera-skeleton-like! font-vera-plain text-vera-heading-3 w-3/4"
        />
      </div>

      <span aria-hidden="true" className={divider()} />

      <div className={column()}>
        <Skeleton
          variant="text"
          className="bg-vera-skeleton-like! font-vera-plain text-vera-caption-semibold w-1/3"
        />
        <Skeleton
          variant="text"
          className="bg-vera-skeleton-like! font-vera-plain text-vera-body-extended-semibold w-1/2"
        />
        <Skeleton
          variant="text"
          className="bg-vera-skeleton-like! font-vera-plain text-vera-caption w-2/3"
        />
      </div>
    </div>
  );
};

export default ScheduleCountdownPanelSkeleton;
