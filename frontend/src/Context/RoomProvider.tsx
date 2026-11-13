import useSessionKeyParam from '@hooks/useSessionKeyParam';
import type { PropsWithChildren } from 'react';
import { serverSettings$ } from '@core/stores';
import { BackgroundPublisherProvider } from './BackgroundPublisherProvider';

/**
 * Old RoomContext renamed to RoomProvider
 * Wrapper for all of the contexts used by the waiting room and the meeting room.
 * @returns {ReactElement} The context.
 */
const RoomProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { sessionKey, sessionKeyStatus } = useSessionKeyParam();
  return (
    <serverSettings$.Provider sessionKey={sessionKeyStatus === 'valid' ? sessionKey : null}>
      <BackgroundPublisherProvider>{children}</BackgroundPublisherProvider>
    </serverSettings$.Provider>
  );
};

export default RoomProvider;
