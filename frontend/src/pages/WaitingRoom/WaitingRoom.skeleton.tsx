import React, { ComponentProps } from 'react';
import useIsSmallViewport from '@hooks/useIsSmallViewport';
import Banner from '@components/Banner';
import VideoContainerSkeleton from '@components/WaitingRoom/VideoContainer/VideoContainer.skeleton';
import UsernameInputSkeleton from '@components/WaitingRoom/UserNameInput/UserNameInput.skeleton';
import classNames from 'classnames';
import Box from '@ui/Box';
import PageLayout from '@ui/PageLayout';

type WaitingRoomSkeletonProps = ComponentProps<'div'>;

const WaitingRoomSkeleton: React.FC<WaitingRoomSkeletonProps> = ({ className, ...props }) => {
  const isSmallViewport = useIsSmallViewport();

  return (
    <Box data-testid="waitingRoom" className={classNames(className)} {...props}>
      <PageLayout>
        <PageLayout.Banner>
          <Banner />
        </PageLayout.Banner>
        <PageLayout.Left>
          <div
            className={`max-w-full flex-col ${isSmallViewport ? '' : 'h-[394px]'} sm:inline-flex`}
          >
            <VideoContainerSkeleton />
          </div>
        </PageLayout.Left>
        <PageLayout.Right>
          <UsernameInputSkeleton />
        </PageLayout.Right>
      </PageLayout>
    </Box>
  );
};

export default WaitingRoomSkeleton;
