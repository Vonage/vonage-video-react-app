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
    <CircularProgress
      data-testid="VideoLoading"
      sx={{
        position: 'relative',
        zIndex: 10,
      }}
    />
  );
};

export default VideoLoading;
