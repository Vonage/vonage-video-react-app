import { VideoClient } from '../routes/video';
import getSessionStorageService from '../sessionStorageService';
import blockCallsForArgs from './blockCallsForArgs';
import { isNil, isValidRoomName } from '@common/assertions';
import { makeBadRequestErrorHandler } from '@api-lib/errors';
import verifySessionKeySignature from '../routes/video/helpers/verifySessionKeySignature';
import resignSessionKey from '../routes/video/helpers/resignSessionKey';
import isLegacySessionKeyAllowed from '../routes/video/helpers/isLegacySessionKeyAllowed';
import type { RequestWithTokenAuth } from '../middleware/authMiddleware/authMiddleware';
import { getScheduleWindow } from '@common/helpers';
import { tryCatch } from '@common/execution';
import type { SessionKeyPayload } from '@common/types';
import { assertScheduleOpen, MeetingEndedError } from '@api-lib/schedule';

const sessionService = getSessionStorageService();

const getOrCreateSessionKeyFromRoomName = async ({
  videoClient,
  roomName,
  user,
}: {
  roomName: string;
  videoClient: VideoClient;
  user: RequestWithTokenAuth['user'];
}) => {
  return blockCallsForArgs(async () => {
    const storedSessionKey = await sessionService.getSessionKeyByRoomName({ roomName });

    if (storedSessionKey) {
      const storedSessionKeySignature = verifySessionKeySignature({
        sessionKey: storedSessionKey,
        videoClient,
      });
      const isStoredSessionKeyLegacy = storedSessionKeySignature.signature === 'legacy';
      const shouldResignStoredSessionKey =
        isStoredSessionKeyLegacy && isLegacySessionKeyAllowed({ user });

      const isStoredSessionKeyEnded =
        storedSessionKeySignature.signature === 'current' &&
        isScheduleEnded(videoClient.decodeSessionKey({ sessionKey: storedSessionKey }));
      const isStoredSessionKeyUnusable =
        storedSessionKeySignature.signature === 'unverifiable' ||
        isStoredSessionKeyLegacy ||
        isStoredSessionKeyEnded;

      if (shouldResignStoredSessionKey) {
        const sessionKey = resignSessionKey({
          claims: storedSessionKeySignature.claims,
          videoClient,
        });
        const { sessionId } = videoClient.decodeSessionKey({ sessionKey });

        await sessionService.setSession({ roomName, sessionKey, sessionId });

        return sessionKey;
      }

      if (!isStoredSessionKeyUnusable) return storedSessionKey;
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

function isScheduleEnded(sessionKeyPayload: SessionKeyPayload): boolean {
  const scheduleWindow = getScheduleWindow(sessionKeyPayload);
  if (isNil(scheduleWindow)) return false;

  const { error } = tryCatch(() => assertScheduleOpen(scheduleWindow));
  return error instanceof MeetingEndedError;
}

export default getOrCreateSessionKeyFromRoomName;
