import type { FC } from 'react';
import SessionProvider from '@Context/SessionProvider/session';
import { PublisherProvider } from '@Context/PublisherProvider';
import MeetingRoom from '@pages/MeetingRoom';
import { UnavailableMiniModeProvider } from '@Context/MiniMode';

/**
 * MeetingRoomStage
 *
 * Embeddable version of the meeting room. Provides SessionProvider and PublisherProvider.
 */
const MeetingRoomStage: FC = () => (
  <SessionProvider skipBrowserUrlUpdate>
    <PublisherProvider>
      <UnavailableMiniModeProvider>
        <MeetingRoom className="h-full w-full" fullSize />
      </UnavailableMiniModeProvider>
    </PublisherProvider>
  </SessionProvider>
);

export default MeetingRoomStage;
