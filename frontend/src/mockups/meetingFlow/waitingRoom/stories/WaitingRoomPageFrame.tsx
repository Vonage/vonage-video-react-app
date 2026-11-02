import type { ComponentType, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '@ui';
import NotificationItem from '@ui/components/NotificationItem';
import type { NotificationId } from '@core/stores/notifications';
import Banner from '@components/Banner';
import Footer from '@components/Footer/Footer';
import VideoContainerSkeleton from '@components/WaitingRoom/VideoContainer/VideoContainer.skeleton';
import meetingSchedule$ from '../context/meetingScheduleContext';
import sampleScheduleStates, { type SampleScheduleState } from './sampleScheduleStates';

const STARTED_TOAST_ID = 'notification:meeting-started-page' as NotificationId;

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
  const { t } = useTranslation();
  const sample = sampleScheduleStates.find(({ key }) => key === stateKey)!;

  return (
    <div className="relative">
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
      {stateKey === 'started' && (
        <div className="absolute inset-x-0 top-4 flex justify-center px-4">
          <NotificationItem
            id={STARTED_TOAST_ID}
            type="success"
            message={t('meetingFlow.waitingRoom.startedToast')}
            expirationMs={null}
            onDismiss={() => {}}
          />
        </div>
      )}
    </div>
  );
};

export default WaitingRoomPageFrame;
