import type { ClientLogEvent } from '@common/logger';
import getAppVersion from '@utils/getAppVersion';

/** Correlation id: same for all events from this page load. Enables grouping in Kibana. */
const correlationIdForPageLoad = crypto.randomUUID();

type ClientEventInput = {
  level: ClientLogEvent['level'];
  action: string;
  variation?: string;
  payload?: Record<string, unknown>;
  sessionId: string;
  connectionId: string;
  timestamp?: number;
  partnerId: string;
};

/**
 * Builds a ClientLogEvent from input, filling in guid, userAgent, source, clientVersion, etc.
 * Uses input.timestamp or Date.now() for clientSystemTime.
 */
export function createClientEvent(input: ClientEventInput): ClientLogEvent {
  return {
    action: input.action,
    variation: input.variation,
    payload: input.payload as ClientLogEvent['payload'],
    sessionId: input.sessionId,
    connectionId: input.connectionId,
    clientSystemTime: input.timestamp ?? Date.now(),
    userAgent: typeof navigator === 'undefined' ? '' : navigator.userAgent,
    level: input.level,
    guid: correlationIdForPageLoad,
    clientVersion: getAppVersion(),
    source:
      typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'unknown',
    name: 'vera',
    componentId: 'vera',
    partnerId: input.partnerId,
  };
}
