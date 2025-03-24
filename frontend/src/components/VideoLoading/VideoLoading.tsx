import CircularProgress from '@mui/material/CircularProgress';
import { ReactElement } from 'react';

export type VideoLoadingProps = {
  isSubscriber?: boolean;
};

/**
 * VideoLoading Component
 *
 * Displays a video loading component while a video tile is being initialized.
 * @param {VideoLoadingProps} props - The props for the component
 *  @property {boolean} isSubscriber - Whether the video tile loaded is a subscriber
 * @returns {ReactElement} - The VideoLoading component
 */
const VideoLoading = ({ isSubscriber }: VideoLoadingProps): ReactElement => {
  const className = `absolute flex ${!isSubscriber ? 'h-[328px] w-dvw items-center justify-center rounded-2xl bg-black' : ''}`;

  return (
    <div data-testid="VideoLoading" className={className}>
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
