import React from 'react';
import useIsSmallViewport from '@hooks/useIsSmallViewport';
import SmallViewportHeader from '@components/MeetingRoom/SmallViewportHeader';
import Box from '@mui/material/Box';
import type { BoxProps } from '@mui/material/Box';
import useTheme from '@ui/theme';
import CircularProgress from '@mui/material/CircularProgress';

type MeetingRoomSkeletonProps = BoxProps;

const MeetingRoomSkeleton: React.FC<MeetingRoomSkeletonProps> = ({ sx, ...props }) => {
  const theme = useTheme();
  const isSmallViewport = useIsSmallViewport();

  // Height is 100dvh - toolbar height (80px) and header height (80px) - 24px wrapper margin on small viewport device
  // Height is 100dvh - toolbar height (80px) - 24px wrapper margin on desktop
  const wrapperHeight = isSmallViewport ? 'calc(100dvh - 184px)' : 'calc(100dvh - 104px)';
  const wrapperWidth = 'calc(100vw - 24px)';

  return (
    <Box
      data-testid="meetingRoom"
      sx={{
        height: 'calc(100dvh - 80px)',
        width: '100vw',
        backgroundColor: theme.colors.darkBackground,
        ...sx,
      }}
      {...props}
      className="animate-fade-in"
    >
      {isSmallViewport && <SmallViewportHeader />}

      {/* VideoTileCanvas Skeleton */}
      <Box
        sx={{
          padding: 3,
          width: wrapperWidth,
          height: wrapperHeight,
        }}
      >
        <Box
          sx={{ position: 'relative', width: '100%', height: '100%' }}
          className="flex justify-center items-center"
        >
          <CircularProgress
            data-testid="progress-spinner"
            sx={{ position: 'absolute', top: '50%' }}
          />
        </Box>
      </Box>

      {/* Toolbar Skeleton */}
      <Box
        sx={{
          height: '80px',
          display: 'flex',
          flexDirection: 'row',
          gap: 3,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgb(32, 33, 36)',
          padding: 4,
        }}
      >
        <ButtonGroupSkeleton>
          <ToolBarButtonSkeleton isTransparent />
          <ToolBarButtonSkeleton isTransparent />
        </ButtonGroupSkeleton>

        <ButtonGroupSkeleton>
          <ToolBarButtonSkeleton isTransparent />
          <ToolBarButtonSkeleton isTransparent />
        </ButtonGroupSkeleton>

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
      sx={{
        height: '48px',
        width: '48px',
        backgroundColor: isExit
          ? 'rgb(239, 68, 68)'
          : isTransparent
            ? 'transparent'
            : 'rgba(60, 64, 67, .55)',
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
      }}
    />
  );
}

type ButtonGroupSkeletonProps = {
  children: React.ReactNode;
};

function ButtonGroupSkeleton({ children }: ButtonGroupSkeletonProps) {
  return (
    <Box
      sx={{
        backgroundColor: 'rgba(60, 64, 67, .55)',
        borderRadius: '50px',
        display: 'flex',
        flexDirection: 'row',
        gap: 1,
      }}
    >
      {children}
    </Box>
  );
}

export default MeetingRoomSkeleton;
