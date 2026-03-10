import { FC } from 'react';
import { Card, CardProps } from '@ui';
import { Skeleton } from '@mui/material';
import Separator from '@components/Separator';
import { twMerge } from 'tailwind-merge';

type UsernameInputSkeletonProps = Omit<CardProps<'form'>, 'sx'>;

const UsernameInputSkeleton: FC<UsernameInputSkeletonProps> = ({ className, ...props }) => {
  return (
    <Card
      component="form"
      className={twMerge('flex-col sm:inline-flex h-auto sm:h-100 lg:max-w-125', className)}
      {...props}
    >
      <div className="w-full flex flex-col gap-4">
        {/* title */}
        <Skeleton variant="text" className="h-7! sm:h-10! w-2/3" />

        {/* name input */}
        <Skeleton variant="text" id="user-name" className="h-7! sm:h-10!" />

        <Separator width="100%" />

        {/* subtitle */}
        <Skeleton className="h-7! sm:h-10!" />

        {/* room name */}
        <Skeleton variant="text" className="h-7! sm:h-10! w-5/6" />

        <Skeleton variant="rounded" className="h-7! sm:h-8! rounded-lg!" />
      </div>
    </Card>
  );
};

export default UsernameInputSkeleton;
