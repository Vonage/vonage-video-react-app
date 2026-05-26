import type { ClientLogEvent } from '@common/types';
import getAppVersion from '@utils/getAppVersion';
import OT from '@vonage/client-sdk-video';
import uniqueId from 'react-global-state-hooks/uniqueId';

/** Correlation id: same for all events from this page load. Enables grouping in Kibana. */
const correlationIdForPageLoad = uniqueId('page-load:');

type ClientEventInput = {
  level: ClientLogEvent['level'];
  action: string;
  payload?: Record<string, unknown>;
  sessionId?: string;
  connectionId?: string;
  partnerId?: string;
  userId?: string;
  variation?: string;
  logVersion?: string;
  timestamp?: number;
  name?: string;
  componentId?: string;
};

const getPlatform = () => ({
  userAgent: typeof navigator === 'undefined' ? '' : navigator.userAgent,
  source:
    typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'unknown',
});

/**
 * Builds a ClientLogEvent from input, filling in guid, userAgent, source, clientVersion, etc.
 * Uses input.timestamp or Date.now() for clientSystemTime.
 */
export function createClientEvent(input: ClientEventInput): ClientLogEvent {
  const { userAgent, source } = getPlatform();
  return {
    action: input.action,
    variation: input.variation,
    logVersion: input.logVersion ?? '2',
    payload: input.payload,
    clientSystemTime: input.timestamp ?? Date.now(),
    level: input.level,
    guid: correlationIdForPageLoad,
    clientVersion: getAppVersion(),
    sdkId: (OT as { version?: string }).version ?? 'unknown',
    source,
    userAgent,
    name: input.name ?? 'vera',
    componentId: input.componentId ?? 'vera',
    ...(input.sessionId != null && { sessionId: input.sessionId }),
    ...(input.connectionId != null && { connectionId: input.connectionId }),
    ...(input.partnerId != null && { partnerId: input.partnerId }),
    ...(input.userId != null && { userId: input.userId }),
  };
}
