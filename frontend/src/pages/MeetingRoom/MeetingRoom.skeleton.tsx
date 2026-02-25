import React from 'react';
import useIsSmallViewport from '@hooks/useIsSmallViewport';
import SmallViewportHeader from '@components/MeetingRoom/SmallViewportHeader';
import Box from '@mui/material/Box';
import type { BoxProps } from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import classNames from 'classnames';
import { twMerge } from 'tailwind-merge';

type MeetingRoomSkeletonProps = BoxProps;

const MeetingRoomSkeleton: React.FC<MeetingRoomSkeletonProps> = ({ className, ...props }) => {
  const isSmallViewport = useIsSmallViewport();

  return (
    <Box
      data-testid="meetingRoom"
      {...props}
      className={twMerge(
        classNames(
          'MeetingRoomSkeleton h-full w-screen bg-vera-dark-background flex flex-col',
          className
        )
      )}
    >
      {isSmallViewport && <SmallViewportHeader />}

      {/* VideoTileCanvas Skeleton */}
      <Box className="px-6 flex-1">
        <Box className="flex justify-center items-center w-full h-full relative">
          <CircularProgress data-testid="progress-spinner" className="absolute top-1/2" />
        </Box>
      </Box>

      {/* Toolbar Skeleton */}
      <Box className="flex flex-row gap-6 justify-center items-center h-20 p-4">
        {!isSmallViewport && (
          <>
            <ButtonGroupSkeleton>
              <ToolBarButtonSkeleton isTransparent />
              <ToolBarButtonSkeleton isTransparent />
            </ButtonGroupSkeleton>

            <ButtonGroupSkeleton>
              <ToolBarButtonSkeleton isTransparent />
              <ToolBarButtonSkeleton isTransparent />
            </ButtonGroupSkeleton>
          </>
        )}

        {new Array(3).fill(null).map((_, index) => (
          <ToolBarButtonSkeleton key={index} />
        ))}

        <ToolBarButtonSkeleton isExit />
      </Box>
    </Box>
  );
};

type ToolBarButtonSkeletonProps = {
  isTransparent?: boolean;
  isExit?: boolean;
};

function ToolBarButtonSkeleton({ isTransparent, isExit }: ToolBarButtonSkeletonProps) {
  return (
    <Box
      component="button"
      tabIndex={-1}
      type="button"
      className={twMerge(
        classNames('h-12 w-12 rounded-full border-none cursor-pointer text-vera-on-secondary', {
          'bg-vera-alert-text': isExit,
          'bg-transparent': isTransparent && !isExit,
          'bg-vera-dark-grey-opacity': !isExit && !isTransparent,
        })
      )}
    />
  );
}

type ButtonGroupSkeletonProps = {
  children: React.ReactNode;
};

function ButtonGroupSkeleton({ children }: ButtonGroupSkeletonProps) {
  return (
    <Box className="flex flex-row gap-2 rounded-full bg-vera-dark-grey-opacity">{children}</Box>
  );
}

export default MeetingRoomSkeleton;
