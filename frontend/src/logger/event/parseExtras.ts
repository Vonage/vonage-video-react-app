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
    sessionId: typeof sessionId === 'string' ? sessionId : undefined,
    connectionId: typeof connectionId === 'string' ? connectionId : undefined,
    timestamp: typeof timestamp === 'number' ? timestamp : undefined,
    partnerId: typeof partnerId === 'string' ? partnerId : undefined,
    payload: Object.keys(rest).length ? rest : undefined,
  };
}
