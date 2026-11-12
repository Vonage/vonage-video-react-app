import { useMemo, type FC } from 'react';
import { Card, CardProps } from '@ui';
import Skeleton from '@ui/components/Skeleton';
import Separator from '@components/Separator';
import { twMerge } from 'tailwind-merge';
import { isNil } from '@common/assertions';
import { decodeJwt, readScheduleClaim } from '@common/helpers';
import useSessionKeyParam from '@hooks/useSessionKeyParam';
import ScheduleCountdownPanelSkeleton from './components/ScheduleCountdownPanel/ScheduleCountdownPanel.skeleton';

type UsernameInputSkeletonProps = Omit<CardProps<'form'>, 'sx'>;

const UsernameInputSkeleton: FC<UsernameInputSkeletonProps> = ({ className, ...props }) => {
  const { sessionKey, sessionKeyStatus } = useSessionKeyParam();

  const hasSchedule = useMemo(
    function readHasSchedule() {
      return (
        sessionKeyStatus === 'valid' &&
        !isNil(readScheduleClaim(decodeJwt<Record<string, unknown>>(sessionKey)))
      );
    },
    [sessionKey, sessionKeyStatus]
  );

  return (
    <Card
      component="form"
      className={twMerge('flex-col sm:inline-flex h-auto sm:h-100 lg:max-w-125', className)}
      {...props}
    >
      <div className="w-full flex flex-col gap-4">
        <div className="flex w-full flex-col gap-1">
          <Skeleton variant="text" className="font-vera-plain text-vera-caption-semibold w-1/3" />
          <Skeleton variant="text" className="font-vera-plain text-vera-heading-2 w-2/3" />
        </div>

        <Separator width="100%" />

        {hasSchedule && (
          <>
            <ScheduleCountdownPanelSkeleton />
            <Separator width="100%" />
          </>
        )}

        <div className="flex w-full flex-col gap-2">
          <Skeleton variant="text" className="font-vera-plain text-vera-caption-semibold w-1/4" />
          <Skeleton variant="rounded" className="h-10! rounded-vera-medium!" />
        </div>

        <Skeleton variant="rounded" className="h-10! rounded-vera-medium!" />
      </div>
    </Card>
  );
};

export default UsernameInputSkeleton;
