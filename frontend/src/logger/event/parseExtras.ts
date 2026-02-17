import isString from '@common/assertions/isString';

type ParsedExtra = {
  sessionId?: string;
  connectionId?: string;
  timestamp?: number;
  partnerId?: string;
  payload?: Record<string, unknown>;
};

/**
 * Extracts reserved keys (sessionId, connectionId, timestamp, partnerId) from extra.
 * Puts remaining keys into payload. Validates types (string for ids, number for timestamp).
 */
export function parseExtra(extra?: Record<string, unknown>): ParsedExtra {
  const { sessionId, connectionId, timestamp, partnerId, ...rest } = extra ?? {};

  return {
    sessionId: isString(sessionId) ? sessionId : undefined,
    connectionId: isString(connectionId) ? connectionId : undefined,
    timestamp: typeof timestamp === 'number' ? timestamp : undefined,
    partnerId: isString(partnerId) ? partnerId : undefined,
    payload: Object.keys(rest).length ? rest : undefined,
  };
}
