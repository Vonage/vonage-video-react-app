import { useNavigate } from 'react-router-dom';
import useSessionContext from './useSessionContext';
import useBackgroundPublisherContext from './useBackgroundPublisherContext';

/**
 * Leaves the meeting: disconnects the session, releases the background publisher, and opens the goodbye page.
 * @returns {() => void} Leaves the meeting when called
 */
const useLeaveMeeting = (): (() => void) => {
  const navigate = useNavigate();
  const { disconnect, sessionKey } = useSessionContext();
  const { destroyBackgroundPublisher } = useBackgroundPublisherContext();

  return () => {
    if (disconnect) {
      disconnect();
      destroyBackgroundPublisher();
    }
    void navigate(`/goodbye/${sessionKey ?? ''}`);
  };
};

export default useLeaveMeeting;
