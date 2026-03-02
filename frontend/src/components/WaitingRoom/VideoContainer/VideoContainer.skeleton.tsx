import { ComponentProps, FC } from 'react';
import classNames from 'classnames';
import PreviewAvatar from '../PreviewAvatar';
import VignetteEffect from '../VignetteEffect';
import { twMerge } from 'tailwind-merge';

type VideoContainerSkeletonProps = ComponentProps<'div'>;

const VideoContainerSkeleton: FC<VideoContainerSkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      data-testid="VideoContainerSkeleton"
      className={twMerge(
        classNames(
          'relative flex flex-col items-center justify-center',
          'aspect-video max-w-full',
          'bg-vera-surface',
          'rounded-vera-none sm:rounded-vera-large',
          '[-webkit-mask:linear-gradient(var(--vera-surface)_0_0)]',
          'box-border w-dvw sm:w-[584px] md:w-full',

          // visibility & positioning
          'opacity-80',

          // aspect & size
          'sm:h-[328px]',

          // background & shape
          'bg-black md:rounded-xl overflow-hidden',

          className
        )
      )}
      {...props}
    >
      <VignetteEffect />

      <PreviewAvatar username="" initials="" isVideoEnabled={false} isVideoLoading={false} />
    </div>
  );
};

export default VideoContainerSkeleton;
