import CircularProgress from '@mui/material/CircularProgress';
import classNames from 'classnames';
import React, { ComponentProps } from 'react';

type VideoLoadingProps = ComponentProps<'div'>;

/**
 * VideoLoading Component
 *
 * Displays a video loading component while the Preview Publisher is being initialized.
 * @param root0
 * @param root0.className
 * @returns {ReactElement} - The VideoLoading component
 */
const VideoLoading: React.FC<VideoLoadingProps> = ({ className, ...props }) => {
  return (
    <div
      data-testid="VideoLoading"
      className={classNames(
        'absolute flex h-[328px] w-dvw items-center justify-center rounded-2xl bg-black',
        className
      )}
      {...props}
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
