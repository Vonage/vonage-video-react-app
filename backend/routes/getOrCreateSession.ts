import blockCallsForArgs from '../helpers/blockCallsForArgs';
import { SessionStorage } from '../storage/sessionStorage';
import { VideoService } from '../videoService/videoServiceInterface';

type CreateGetOrCreateSessionDependencies = {
  sessionService: SessionStorage;
  videoService: VideoService;
};

/**
 * Factory function for the getOrCreateSession function documented below
 * @param {CreateGetOrCreateSessionDependencies} dependencies - required injected dependencies
 *   @property {SessionStorage} sessionStorage - sessionStorage instance
 *   @property {VideoService} videoService - videoService instance
 * @returns {Function} getOrCreateSession function
 */
const createGetOrCreateSession = ({
  sessionService,
  videoService,
}: CreateGetOrCreateSessionDependencies) => {
  /**
   * Gets or creates a session in a thread safe (async operation safe) way.
   * The function is wrapped in blockCallsForArgs to ensure that simultaneous calls for a room name return the same session.
   * Not blocking these calls would result in separate sessions being created for the same room name.
   * @param {string} roomName - name of the meeting room
   * @returns {Promise<string>} the sessionId
   */
  const getOrCreateSession = blockCallsForArgs(async (roomName: string) => {
    let sessionId = await sessionService.getSession(roomName);
    if (!sessionId) {
      sessionId = await videoService.createSession();
      await sessionService.setSession(roomName, sessionId);
    }
    return sessionId;
  });
  return getOrCreateSession;
};

export default createGetOrCreateSession;
