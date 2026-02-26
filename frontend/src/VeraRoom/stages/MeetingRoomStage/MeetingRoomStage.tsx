import type { FC } from 'react';
import SessionProvider from '@Context/SessionProvider/session';
import { PublisherProvider } from '@Context/PublisherProvider';
import MeetingRoom from '@pages/MeetingRoom';

/**
 * MeetingRoomStage
 *
 * Embeddable version of the meeting room. Provides SessionProvider and
 * PublisherProvider which are normally added at the route level in App.tsx.
 *
 * ⚠️ Known layout limitation:
 * MeetingRoom currently uses `height: calc(100dvh - 80px)` and `width: 100vw`
 * which are viewport-relative units and will overflow the embed container.
 * This needs to be addressed by refactoring MeetingRoom to accept a `className`
 * prop so the stage can pass `h-full w-full` instead.
 */
const MeetingRoomStage: FC = () => (
  <SessionProvider>
    <PublisherProvider>
      <MeetingRoom />
    </PublisherProvider>
  </SessionProvider>
);

export default MeetingRoomStage;
