import CircularProgress from '@mui/material/CircularProgress';
import { ReactElement } from 'react';

/**
 * VideoLoading Component
 *
 * Displays a video loading component while the Preview Publisher is being initialized.
 * @returns {ReactElement} - The VideoLoading component
 */
const VideoLoading = (): ReactElement => {
  return (
    <div
      data-testid="VideoLoading"
      className="absolute flex h-[328px] w-dvw items-center justify-center rounded-2xl bg-black"
    >
      <CircularProgress
        sx={{
          position: 'relative',
          zIndex: 10,
        }}
        data-testid="CircularProgress"
      />
    </div>
  );
};

export default VideoLoading;
