import type { ClientLogEvent } from '@common/types';
import getAppVersion from '@utils/getAppVersion';
import OT from '@vonage/client-sdk-video';

/** Correlation id: same for all events from this page load. Enables grouping in Kibana. */
const correlationIdForPageLoad = crypto.randomUUID();

type ClientEventInput = {
  level: ClientLogEvent['level'];
  action: string;
  payload?: Record<string, unknown>;
  sessionId?: string;
  connectionId?: string;
  timestamp?: number;
  partnerId?: string;
};

/**
 * Builds a ClientLogEvent from input, filling in guid, userAgent, source, clientVersion, etc.
 * Uses input.timestamp or Date.now() for clientSystemTime.
 */
export function createClientEvent(input: ClientEventInput): ClientLogEvent {
  const event: ClientLogEvent = {
    action: input.action,
    payload: input.payload,
    clientSystemTime: input.timestamp ?? Date.now(),
    userAgent: typeof navigator === 'undefined' ? '' : navigator.userAgent,
    level: input.level,
    guid: correlationIdForPageLoad,
    clientVersion: getAppVersion(),
    sdkId: (OT as { version?: string }).version ?? 'unknown',
    source:
      typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'unknown',
    name: 'vera',
    componentId: 'vera',
  };
  if (input.sessionId !== undefined) event.sessionId = input.sessionId;
  if (input.connectionId !== undefined) event.connectionId = input.connectionId;
  if (input.partnerId !== undefined) event.partnerId = input.partnerId;
  return event;
}
