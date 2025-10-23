import React, { ComponentProps } from 'react';
import useIsSmallViewport from '@hooks/useIsSmallViewport';
import Banner from '@components/Banner';
import VideoContainerSkeleton from '@components/WaitingRoom/VideoContainer/VideoContainer.skeleton';
import UsernameInputSkeleton from '@components/WaitingRoom/UserNameInput/UserNameInput.skeleton';
import classNames from 'classnames';

type WaitingRoomSkeletonProps = ComponentProps<'div'>;

const WaitingRoomSkeleton: React.FC<WaitingRoomSkeletonProps> = ({ className, ...props }) => {
  const isSmallViewport = useIsSmallViewport();

  return (
    <div
      className={classNames('flex size-full flex-col bg-white', className)}
      data-testid="waitingRoom"
      {...props}
    >
      <Banner className="opacity-80" />
      <div className="flex w-full">
        <div className="flex w-full justify-center">
          <div className="flex w-full flex-col items-center justify-center sm:min-h-[90vh] md:flex-row">
            <div
              className={`max-w-full flex-col ${isSmallViewport ? '' : 'h-[394px]'} sm: inline-flex`}
            >
              <VideoContainerSkeleton />
            </div>

            <UsernameInputSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoomSkeleton;
