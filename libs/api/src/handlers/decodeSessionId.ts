import { makeInternalErrorHandler } from '@api-lib/errors';
import type { IVideoOrchestrator, DecodeSessionIdPayload } from '@api-lib/types';
import { decodeSessionId as decodeSessionIdHelper } from '@node/helpers';

function decodeSessionId(this: IVideoOrchestrator, payload: DecodeSessionIdPayload) {
  try {
    const { sessionId } = payload;

    const decodedSession = decodeSessionIdHelper(sessionId);

    return decodedSession;
  } catch (error) {
    throw makeInternalErrorHandler('Failed to decode session ID')(error);
  }
}

export default decodeSessionId;
