import { API_URL } from '../../utils/constants';
import isErrorLike from '@common/assertions/isErrorLike';
import type { ClientLogEvent } from '@common/types';
import { formatToStore } from 'json-storage-formatter';
import { createClientEvent } from '../event';

/**
 * Transport that POSTs ClientLogEvent to the backend.
 * Uses sendBeacon for fire-and-forget telemetry; falls back to fetch with keepalive if unavailable.
 */
export class BackendLogTransport {
  private readonly endpoint = `${API_URL}/client-logs`;

  log(event: string, extra?: Record<string, unknown>): void {
    const { sessionId, connectionId, partnerId, ...rest } = extra ?? {};
    const clientEvent = {
      ...createClientEvent({
        level: 'info',
        action: event,
        sessionId: typeof sessionId === 'string' ? sessionId : undefined,
        connectionId: typeof connectionId === 'string' ? connectionId : undefined,
        partnerId: typeof partnerId === 'string' ? partnerId : undefined,
        payload: rest,
      }),
      variation: 'Success',
    };
    this.send(clientEvent);
  }

  reportError(error: unknown, extra?: Record<string, unknown>): void {
    const { sessionId, connectionId, partnerId, ...rest } = extra ?? {};
    const errorPayload = {
      error: isErrorLike(error)
        ? {
            message: (error as Error).message,
            name: (error as Error).name,
            stack: (error as Error).stack,
          }
        : error,
      ...rest,
    };
    const clientEvent = {
      ...createClientEvent({
        level: 'error',
        action: 'Error',
        sessionId: typeof sessionId === 'string' ? sessionId : undefined,
        connectionId: typeof connectionId === 'string' ? connectionId : undefined,
        partnerId: typeof partnerId === 'string' ? partnerId : undefined,
        payload: errorPayload,
      }),
      variation: isErrorLike(error) ? ((error as Error).name ?? 'Error') : 'Failure',
    };
    this.send(clientEvent);
  }

  private send(event: ClientLogEvent): void {
    let body: string;
    try {
      body = formatToStore(event);
    } catch {
      body = '{"error":"[unserializable]"}';
    }

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(this.endpoint, new Blob([body], { type: 'application/json' }));
      return;
    }

    fetch(this.endpoint, {
      method: 'POST',
      body,
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {});
  }
}
