import axios from 'axios';
import OTKAnalytics from 'opentok-solutions-logging';
import loadConfig from '../helpers/config';
import type { ClientLogEvent } from '@common/types';

const { gollumUrl } = loadConfig();

const LOG_ACTION_ENTER_MEETING = 'EnterMeeting';

/**
 * Polyfill for document.cookie required by opentok-solutions-logging in Node.js.
 * The library uses it for guid persistence; we provide a minimal in-memory store.
 */
function ensureDocumentPolyfill(): void {
  if (typeof (globalThis as unknown as { document: { cookie: string } }).document === 'undefined') {
    let cookieStore = '';
    (globalThis as unknown as { document: { cookie: string } }).document = {
      get cookie() {
        return cookieStore;
      },
      set cookie(val: string) {
        cookieStore = val;
      },
    };
  }
}

/**
 * Forwards a validated ClientLogEvent to Gollum/HLG.
 * Backend adds serverReceivedTime when forwarding.
 * Throws on error so the route can catch and handle.
 */
export async function forwardToGollum(event: ClientLogEvent): Promise<void> {
  if (!gollumUrl) {
    throw new Error(
      '[logger] GOLLUM_BASE_URL not configured - logs will not be forwarded to Kibana. Set GOLLUM_BASE_URL in backend .env if you need log ingestion.'
    );
  }

  const body = {
    ...event,
    serverReceivedTime: Date.now(),
  };

  await axios.post(gollumUrl, body, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 5000,
    validateStatus: (status) => status < 500,
  });
}

/**
 * Logs EnterMeeting to the Kibana pipeline using OTKAnalytics.
 * Uses opentok-solutions-logging with server.
 */
export function logOnConnect(event: ClientLogEvent): void {
  const { sessionId, connectionId, partnerId, source, clientVersion } = event;

  if (!sessionId || !connectionId || !partnerId) {
    return;
  }

  ensureDocumentPolyfill();

  const otkAnalyticsProps = {
    name: 'vera' as const,
    componentId: 'vera' as const,
    source: source ?? 'unknown',
    clientVersion: clientVersion ?? 'unknown',
    partnerId,
    sessionId,
  };

  const otkAnalytics = new OTKAnalytics(otkAnalyticsProps, { server: true });
  otkAnalytics.addSessionInfo({
    sessionId,
    connectionId,
    partnerId,
  });

  otkAnalytics.logEvent({ action: LOG_ACTION_ENTER_MEETING });
}

/**
 * Forwards a validated ClientLogEvent: always to Gollum, and for EnterMeeting also via OTKAnalytics.
 */
export async function forward(event: ClientLogEvent): Promise<void> {
  await forwardToGollum(event);

  if (event.action === LOG_ACTION_ENTER_MEETING) {
    logOnConnect(event);
  }
}
