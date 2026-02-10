import CircularProgress from '@mui/material/CircularProgress';
import { FC } from 'react';
import Box from '@mui/material/Box';
import type { BoxProps } from '@mui/material/Box';
import { twMerge } from 'tailwind-merge';

type VideoLoadingProps = {
  className?: string;
} & BoxProps;

/**
 * VideoLoading Component
 *
 * Displays a video loading component while the Preview Publisher is being initialized.
 * @returns {ReactElement} - The VideoLoading component
 */
const VideoLoading: FC<VideoLoadingProps> = ({ className, ...props }) => {
  return (
    <Box
      className={twMerge('absolute flex rounded-vera-large', className)}
      {...props}
      data-testid="VideoLoading"
    >
      <CircularProgress
        sx={{
          position: 'relative',
          zIndex: 10,
        }}
        data-testid="CircularProgress"
      />
    </Box>
  );
};

export default VideoLoading;
