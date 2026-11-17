import getRoomShareUrl from '@utils/getRoomShareUrl';
import useSessionContext from './useSessionContext';
/**
 * Creates a shareable link to the waiting room for the current meeting room.
 * @returns {string} - The shareable link.
 */
const useRoomShareUrl = (): string => {
  const { sessionKey } = useSessionContext();
  const { origin } = window.location;
  return getRoomShareUrl({ origin, sessionKey });
};

export default useRoomShareUrl;
