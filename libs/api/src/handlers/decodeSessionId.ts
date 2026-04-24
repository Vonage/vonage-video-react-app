import { makeInternalErrorHandler } from '@api-lib/errors';
import type { IVideoClient } from '@api-lib/types';
import { DecodedSessionId } from '@common/types';
import { decodeSessionId as decodeSessionIdHelper } from '@node/helpers';

function decodeSessionId(
  this: IVideoClient,
  { sessionId }: { sessionId: string }
): DecodedSessionId {
  try {
    const decodedSession = decodeSessionIdHelper({ sessionId });

    return decodedSession;
  } catch (error) {
    throw makeInternalErrorHandler('Failed to decode session ID')(error);
  }
}

export default decodeSessionId;
