import useSessionContext from './useSessionContext';
/**
 * Creates a shareable link to the waiting room for the current meeting room.
 * @returns {string} - The shareable link.
 */
const useRoomShareUrl = (): string => {
  const { sessionKey } = useSessionContext();
  const { origin } = window.location;
  return `${origin}/waiting-room/${sessionKey}`;
};

export default useRoomShareUrl;
