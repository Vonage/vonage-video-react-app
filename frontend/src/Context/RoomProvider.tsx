import { PropsWithChildren } from 'react';
import advancedSettingsDialog$ from '@Context/AdvancedSettingsDialog';
import { BackgroundPublisherProvider } from './BackgroundPublisherProvider';

/**
 * Old RoomContext renamed to RoomProvider
 * Wrapper for all of the contexts used by the waiting room and the meeting room.
 * @returns {ReactElement} The context.
 */
const RoomProvider: React.FC<PropsWithChildren> = ({ children }) => (
  <advancedSettingsDialog$.Provider>
    <BackgroundPublisherProvider>{children}</BackgroundPublisherProvider>
  </advancedSettingsDialog$.Provider>
);

export default RoomProvider;
