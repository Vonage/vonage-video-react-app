import useRoomName from './useRoomName';
import { env } from '../env';

/**
 * Creates a shareable link to the waiting room for the current meeting room.
 * When running inside Electron, window.location.origin is 'http://localhost:PORT'
 * which is not externally reachable. If TUNNEL_DOMAIN is configured (e.g. an ngrok
 * domain), it is used as the base so the link can be shared with web users.
 * @returns {string} - The shareable link.
 */
const useRoomShareUrl = (): string => {
  const roomName = useRoomName();
  const origin = env.TUNNEL_DOMAIN ? `https://${env.TUNNEL_DOMAIN}` : window.location.origin;
  return `${origin}/waiting-room/${roomName}`;
};

export default useRoomShareUrl;
