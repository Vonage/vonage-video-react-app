import { useNavigate } from 'react-router-dom';
import useSessionContext from './useSessionContext';
import useBackgroundPublisherContext from './useBackgroundPublisherContext';

type GoodbyeState = {
  header: string;
};

/**
 * Leaves the meeting: disconnects the session, releases the background publisher, and opens the goodbye page.
 * @returns {(goodbyeState?: GoodbyeState) => void} Leaves the meeting when called
 */
const useLeaveMeeting = (): ((goodbyeState?: GoodbyeState) => void) => {
  const navigate = useNavigate();
  const { disconnect, sessionKey } = useSessionContext();
  const { destroyBackgroundPublisher } = useBackgroundPublisherContext();

  return (goodbyeState) => {
    if (disconnect) {
      disconnect();
      destroyBackgroundPublisher();
    }
    void navigate(`/goodbye/${sessionKey ?? ''}`, { state: goodbyeState });
  };
};

export default useLeaveMeeting;
