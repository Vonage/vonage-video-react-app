import { VideoClient } from '../routes/video';
import getSessionStorageService from '../sessionStorageService';
import blockCallsForArgs from './blockCallsForArgs';
import { isValidRoomName } from '@common/assertions';
import { makeBadRequestErrorHandler } from '@api-lib/errors';
import loadConfig from './config';
import verifySessionKeySignature from '../routes/video/helpers/verifySessionKeySignature';
import resignSessionKey from '../routes/video/helpers/resignSessionKey';

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

    if (storedSessionKey) {
      const storedSessionKeySignature = verifySessionKeySignature({
        sessionKey: storedSessionKey,
        videoClient,
      });
      const shouldResignStoredSessionKey =
        storedSessionKeySignature.signature === 'legacy' && loadConfig().legacySessionKeysEnabled;

      const isStoredSessionKeyUnverifiable = storedSessionKeySignature.signature === 'unverifiable';

      if (shouldResignStoredSessionKey) {
        const sessionKey = resignSessionKey({
          claims: storedSessionKeySignature.claims,
          videoClient,
        });
        const { sessionId } = videoClient.decodeSessionKey({ sessionKey });

        await sessionService.setSession({ roomName, sessionKey, sessionId });

        return sessionKey;
      }

      if (!isStoredSessionKeyUnverifiable) return storedSessionKey;
    }

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
