import axios from 'axios';
import loadConfig from '../helpers/config';
import type { ClientLogEvent } from '../types/ClientLogEventSchema';
import pLimit from 'p-limit';

// limit to 5 concurrent requests
const limit = pLimit(5);

const { gollumUrl } = loadConfig();

/**
 * Gollum/HLG payload. Maps from our Frontend→Backend contract.
 * Backend adds serverReceivedTime when forwarding. Gollum: POST /{source}/
 */
type GollumClientEventPayload = {
  action: string;
  variation?: string;
  sessionId?: string;
  connectionId?: string;
  clientSystemTime: number;
  payload?: Record<string, unknown> | null;
  source: string;
  guid: string;
  clientVersion?: string;
  logVersion?: string;
  userAgent?: string;
  name?: string;
  componentId?: string;
  partnerId?: string;
};

function mapToGollumPayload(event: ClientLogEvent): GollumClientEventPayload {
  return {
    action: event.action,
    variation: event.variation,
    sessionId: event.sessionId,
    connectionId: event.connectionId,
    clientSystemTime: event.clientSystemTime,
    payload: event.payload ?? null,
    source: event.source,
    guid: event.guid,
    clientVersion: event.clientVersion,
    logVersion: event.logVersion ?? '2',
    userAgent: event.userAgent,
    name: event.name ?? '',
    componentId: event.componentId,
    partnerId: event.partnerId,
  };
}

/**
 * Forwards a validated ClientLogEventSchema to Gollum/HLG.
 * Fire-and-forget: logs errors but does not throw so the /logger route can always return 200.
 */
export async function forwardToGollum(event: ClientLogEvent): Promise<void> {
  if (!gollumUrl) {
    return;
  }

  const body = {
    ...mapToGollumPayload(event),
    serverReceivedTime: Date.now(),
  };

  try {
    await limit(() =>
      axios.post(gollumUrl, body, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000,
        validateStatus: (status) => status < 500,
      })
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[logger] Failed to forward log to Gollum/HLG:', errorMessage);
  }
}
