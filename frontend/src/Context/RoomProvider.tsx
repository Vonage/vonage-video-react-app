import { PropsWithChildren } from 'react';
import { AudioOutputProvider } from './AudioOutputProvider';
import { BackgroundPublisherProvider } from './BackgroundPublisherProvider';

/**
 * Old RoomContext renamed to RoomProvider
 * Wrapper for all of the contexts used by the waiting room and the meeting room.
 * @returns {ReactElement} The context.
 */
const RoomProvider: React.FC<PropsWithChildren> = ({ children }) => (
  <BackgroundPublisherProvider>
    <AudioOutputProvider>{children}</AudioOutputProvider>
  </BackgroundPublisherProvider>
);

export default RoomProvider;
