import type { ClientLogSession } from '@common/types';

/**
 * Splits the logger context identifiers out of a log's extra data, so they travel in the event's
 * `session` object while everything else stays in `payload`.
 */
function splitSessionFromExtra(extra?: Record<string, unknown>): {
  session?: ClientLogSession;
  payload: Record<string, unknown>;
} {
  const { sessionId, connectionId, partnerId, userId, ...payload } = (extra ?? {}) as Record<
    string,
    string | undefined
  >;

  const session: ClientLogSession = { sessionId, connectionId, partnerId, userId };
  const hasSessionData = Object.values(session).some((value) => value != null);

  if (!hasSessionData) return { payload };

  return { session, payload };
}

export default splitSessionFromExtra;
