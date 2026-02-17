import { API_URL } from '../../utils/constants';
import attempt from '@common/execution/attempt';
import idempotentCallbackWithRetry from '@common/execution/idempotentCallbackWithRetry';
import tryCatch from '@common/execution/tryCatch';
import isErrorLike from '@common/assertions/isErrorLike';
import type { ClientLogEvent } from '@common/logger';
import { createClientEvent, parseExtra } from '../event';
import { serializeClientEvent } from './serializeClientEvent';

type PendingEntry = { id: number; body: string };

/**
 * Transport that logs events and errors to the backend.
 * Accepts (event, extra) or (error, extra); builds ClientLogEvent, serializes, and POSTs.
 * Uses fetch for normal sends; flushes any in-flight events via sendBeacon on pagehide (tab close, refresh).
 */
export class BackendLogTransport {
  private readonly endpoint = `${API_URL}/client-logs`;

  /** Events in flight. Removed by id when fetch succeeds; flushed via sendBeacon on pagehide. */
  private pending: PendingEntry[] = [];
  private nextId = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('pagehide', this.flushPendingWithBeacon);
    }
  }

  /** Sends any pending events via sendBeacon (reliable when page is unloading). */
  private readonly flushPendingWithBeacon = (): void => {
    if (!navigator.sendBeacon) return;

    for (const { body } of this.pending) {
      navigator.sendBeacon(this.endpoint, new Blob([body], { type: 'application/json' }));
    }
    this.pending = [];
  };

  /** Logs an event. Fire-and-forget: uses attempt so errors do not propagate. */
  log(event: string, extra?: Record<string, unknown>): void {
    attempt(
      () => {
        const parsed = parseExtra(extra);
        const clientEvent = createClientEvent({
          level: 'info',
          action: event,
          variation: 'Success',
          sessionId: parsed.sessionId ?? '',
          connectionId: parsed.connectionId ?? '',
          partnerId: parsed.partnerId ?? '',
          timestamp: parsed.timestamp,
          payload: parsed.payload,
        });
        this.send(clientEvent);
      },
      (err) => console.error('[logger] log failed:', err)
    );
  }

  /** Reports an error. Fire-and-forget: uses attempt so errors do not propagate. */
  reportError(error: unknown, extra?: Record<string, unknown>): void {
    attempt(
      () => {
        const parsed = parseExtra(extra);
        const err = error as Error;
        const variation = isErrorLike(error) ? (err.name ?? 'Error') : 'Error';
        const errorPayload = {
          error: isErrorLike(error)
            ? { message: err.message, name: err.name, stack: err.stack }
            : error,
          ...(parsed.payload ?? {}),
        };
        const clientEvent = createClientEvent({
          level: 'error',
          action: 'Error',
          variation,
          payload: errorPayload,
          sessionId: parsed.sessionId ?? '',
          connectionId: parsed.connectionId ?? '',
          partnerId: parsed.partnerId ?? '',
          timestamp: parsed.timestamp,
        });
        this.send(clientEvent);
      },
      (err) => console.error('[logger] reportError failed:', err)
    );
  }

  /** Sends a ClientLogEvent using fetch with light retry; adds to pending for pagehide fallback. */
  private send(event: ClientLogEvent): void {
    const safeEvent = serializeClientEvent(event);
    const body = JSON.stringify(safeEvent);
    const id = this.nextId++;

    tryCatch(() => {
      this.pending.push({ id, body });

      idempotentCallbackWithRetry(
        () =>
          fetch(this.endpoint, {
            method: 'POST',
            body,
            keepalive: true,
            headers: { 'Content-Type': 'application/json' },
          }).then((res) => {
            if (res.ok) {
              const index = this.pending.findIndex((p) => p.id === id);
              if (index !== -1) this.pending.splice(index, 1);
              return;
            }
            throw new Error(`HTTP ${res.status}`);
          }),
        { retries: 2, delayMs: 200 }
      ).catch(() => {
        // Keep in pending; sendBeacon will flush on pagehide
      });
    });
  }

  /** Optional: remove pagehide listener if provider is destroyed. */
  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('pagehide', this.flushPendingWithBeacon);
    }
  }
}
