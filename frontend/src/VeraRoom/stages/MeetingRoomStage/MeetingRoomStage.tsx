import type { FC } from 'react';
import SessionProvider from '@Context/SessionProvider/session';
import { PublisherProvider } from '@Context/PublisherProvider';
import MeetingRoom from '@pages/MeetingRoom';

/**
 * MeetingRoomStage
 *
 * Embeddable version of the meeting room. Provides SessionProvider and PublisherProvider.
 */
const MeetingRoomStage: FC = () => (
  <SessionProvider>
    <PublisherProvider>
      <MeetingRoom className="h-full w-full" fullSize />
    </PublisherProvider>
  </SessionProvider>
);

export default MeetingRoomStage;
