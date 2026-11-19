import type { ComponentType, ReactElement } from 'react';
import { PageLayout } from '@ui';
import Banner from '@components/Banner';
import Footer from '@components/Footer/Footer';
import VideoContainerSkeleton from '@components/WaitingRoom/VideoContainer/VideoContainer.skeleton';
import meetingSchedule$ from '../context/meetingScheduleContext';
import sampleScheduleStates, { type SampleScheduleState } from './sampleScheduleStates';

type WaitingRoomPageFrameProps = {
  card: ComponentType;
  stateKey: SampleScheduleState['key'];
};

/**
 * The real waiting-room layout with a card variant on the right, in one sample state.
 */
const WaitingRoomPageFrame = ({
  card: CardVariant,
  stateKey,
}: WaitingRoomPageFrameProps): ReactElement => {
  const sample = sampleScheduleStates.find(({ key }) => key === stateKey)!;

  return (
    <PageLayout>
      <PageLayout.Banner>
        <Banner />
      </PageLayout.Banner>
      <PageLayout.Left>
        <div className="relative flex h-auto max-w-full flex-col sm:inline-flex sm:h-100">
          <VideoContainerSkeleton />
        </div>
      </PageLayout.Left>
      <PageLayout.Right>
        <meetingSchedule$.Provider
          value={(state) => ({
            ...state,
            meetingName: sample.meetingName,
            schedule: sample.schedule,
            username: sample.username,
            isAutoJoinEnabled: sample.isAutoJoinEnabled,
          })}
        >
          <CardVariant />
        </meetingSchedule$.Provider>
      </PageLayout.Right>
      <PageLayout.Footer>
        <Footer />
      </PageLayout.Footer>
    </PageLayout>
  );
};

export default WaitingRoomPageFrame;
