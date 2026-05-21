import { VideoClient } from '../routes/video';
import getSessionStorageService from '../sessionStorageService';
import blockCallsForArgs from './blockCallsForArgs';
import { isValidRoomName } from '@common/assertions';
import { makeBadRequestErrorHandler } from '@api-lib/errors';

const sessionService = getSessionStorageService();

const getOrCreateSessionKeyFromRoomName = async ({
  videoClient,
  roomName,
}: {
  roomName: string;
  videoClient: VideoClient;
}) => {
  return blockCallsForArgs(async () => {
    const storedSessionKey = await sessionService.getSessionKeyByRoomName({ roomName });
    if (storedSessionKey) return storedSessionKey;

    if (!isValidRoomName(roomName)) {
      throw makeBadRequestErrorHandler(`Invalid room name: ${roomName}.`)(null);
    }

    const session = await videoClient.createSession({ roomName });
    const { sessionKey, sessionId } = session;

    await sessionService.setSession({
      roomName,
      sessionKey,
      sessionId,
    });

    return session.sessionKey;
  })(roomName);
};

export default getOrCreateSessionKeyFromRoomName;
