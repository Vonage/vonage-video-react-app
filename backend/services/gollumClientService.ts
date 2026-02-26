import axios from 'axios';
import loadConfig from '../helpers/config';
import type { ClientLogEvent } from '@common/types';

const { gollumUrl } = loadConfig();

/**
 * Forwards a validated ClientLogEvent to Gollum/HLG.
 * Backend adds serverReceivedTime when forwarding. Gollum: POST /{source}/
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
