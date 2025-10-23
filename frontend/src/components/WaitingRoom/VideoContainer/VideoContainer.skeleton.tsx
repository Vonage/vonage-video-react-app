import { ReactElement } from 'react';
import classNames from 'classnames';
import PreviewAvatar from '../PreviewAvatar';
import VignetteEffect from '../VignetteEffect';

const VideoContainerSkeleton = (): ReactElement => {
  return (
    <div
      className={classNames(
        // visibility & positioning
        'opacity-80 relative',

        // layout & alignment
        'flex flex-col items-center justify-center',

        // aspect & size
        'aspect-video w-[584px] max-w-full sm:h-[328px]',

        // background & shape
        'bg-black md:rounded-xl overflow-hidden'
      )}
    >
      <VignetteEffect />

      <PreviewAvatar username="" initials="" isVideoEnabled={false} isVideoLoading={false} />
    </div>
  );
};

export default VideoContainerSkeleton;
