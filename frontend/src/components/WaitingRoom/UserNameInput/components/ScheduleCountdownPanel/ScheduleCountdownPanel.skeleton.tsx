import type { ComponentProps, ReactElement } from 'react';
import Skeleton from '@ui/components/Skeleton';
import SplitPanel from '@ui/layout/SplitPanel';

export const scheduleCountdownPanelSkeletonTestIds = {
  root: 'schedule-countdown-panel-skeleton',
} as const;

const ScheduleCountdownPanelSkeleton = ({
  className,
  ...props
}: ComponentProps<'div'>): ReactElement => {
  return (
    <SplitPanel
      data-testid={scheduleCountdownPanelSkeletonTestIds.root}
      className={className}
      {...props}
    >
      <SplitPanel.Left>
        <Skeleton variant="text" className="font-vera-plain text-vera-caption-semibold w-1/2" />
        <Skeleton variant="text" className="font-vera-plain text-vera-heading-3 w-3/4" />
      </SplitPanel.Left>

      <SplitPanel.Right>
        <Skeleton variant="text" className="font-vera-plain text-vera-caption-semibold w-1/3" />
        <Skeleton
          variant="text"
          className="font-vera-plain text-vera-body-extended-semibold w-1/2"
        />
        <Skeleton variant="text" className="font-vera-plain text-vera-caption w-2/3" />
      </SplitPanel.Right>
    </SplitPanel>
  );
};

export default ScheduleCountdownPanelSkeleton;
