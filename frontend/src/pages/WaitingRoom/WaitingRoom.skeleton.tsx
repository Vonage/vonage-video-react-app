import React, { ComponentProps } from 'react';
import Banner from '@components/Banner';
import VideoContainerSkeleton from '@components/WaitingRoom/VideoContainer/VideoContainer.skeleton';
import UsernameInputSkeleton from '@components/WaitingRoom/UserNameInput/UserNameInput.skeleton';
import classNames from 'classnames';
import Box from '@mui/material/Box';
import PageLayout from '@ui/PageLayout';
import Footer from '@components/Footer/Footer';

type WaitingRoomSkeletonProps = ComponentProps<'div'>;

const WaitingRoomSkeleton: React.FC<WaitingRoomSkeletonProps> = ({ className, ...props }) => {
  return (
    <Box
      data-testid="waitingRoom"
      className={classNames('WaitingRoomSkeleton', className)}
      {...props}
    >
      <PageLayout>
        <PageLayout.Banner>
          <Banner />
        </PageLayout.Banner>

        <PageLayout.Left>
          <div className="flex-col sm:inline-flex h-auto sm:h-100">
            <VideoContainerSkeleton />
          </div>
        </PageLayout.Left>

        <PageLayout.Right>
          <UsernameInputSkeleton className="flex-col sm:inline-flex h-auto sm:h-100 animate-fade-in lg:max-w-125" />
        </PageLayout.Right>

        <PageLayout.Footer>
          <Footer />
        </PageLayout.Footer>
      </PageLayout>
    </Box>
  );
};

export default WaitingRoomSkeleton;
