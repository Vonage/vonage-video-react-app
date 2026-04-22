import { makeBadRequestErrorHandler } from '@api-lib/errors';
import type { IVideoClient } from '@api-lib/types';
import { SessionKeyPayload, VideoSessionDetails } from '@common/types';
import jwt from 'jsonwebtoken';
import { decodeSessionId } from '@node/helpers';

/**
 * Small in-memory cache to avoid repeated JWT verification and session decoding.
 *
 * - Bounded to MAX_ENTRIES to prevent unbounded memory growth
 * - Replaces repeated crypto operations with O(1) lookups
 * - Highly effective under concurrent usage and during spikes
 */
const cache = new Map<string, VideoSessionDetails>();

const MAX_ENTRIES = 1000;

/**
 * Decodes and verifies a sessionKey JWT, returning the decoded session details.
 */
function decodeSessionKey(
  this: IVideoClient,
  { sessionKey }: { sessionKey: string }
): VideoSessionDetails {
  try {
    const cachedDetails = cache.get(sessionKey);

    // SessionKey currently have no expiration, so cached entries do not require age validation.
    if (cachedDetails) {
      cache.delete(sessionKey);
      cache.set(sessionKey, cachedDetails);

      return cachedDetails;
    }

    const { sessionId, ...rest } = jwt.verify(
      sessionKey,
      this._sessionSigning.secret
    ) as SessionKeyPayload;

    const sessionMeta = decodeSessionId({ sessionId });

    const details = { sessionId, ...rest, ...sessionMeta, sessionKey };

    // Store the decoded session details in the cache
    cache.set(sessionKey, details);

    // If the cache exceeds the maximum number of entries, clear it to prevent memory bloat
    if (cache.size > MAX_ENTRIES) {
      const oldestKey = cache.keys().next().value!;
      cache.delete(oldestKey);
    }

    return details;
  } catch (error) {
    throw makeBadRequestErrorHandler(`Invalid sessionKey: \n${sessionKey}`)(error);
  }
}

export default decodeSessionKey;
