import { API_URL } from '../../utils/constants';
import tryCatch from '@common/execution/tryCatch';
import type { ClientLogEvent } from '@common/logger';
import { serializeClientEvent } from './serializeClientEvent';

type PendingEntry = { id: number; body: string };

/**
 * Transport that POSTs ClientLogEvent to the backend.
 * Uses fetch for normal sends; flushes any in-flight events via sendBeacon on pagehide (tab close, refresh).
 */
export class BackendLogTransport {
  private readonly endpoint = `${API_URL}/internal/client-logs`;

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

  /** Sends a ClientLogEvent using fetch; adds to pending for pagehide fallback. */
  send(event: ClientLogEvent): void {
    const safeEvent = serializeClientEvent(event);
    const body = JSON.stringify(safeEvent);
    const id = this.nextId++;

    tryCatch(() => {
      this.pending.push({ id, body });

      fetch(this.endpoint, {
        method: 'POST',
        body,
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
      })
        .then((res) => {
          if (res.ok) {
            const index = this.pending.findIndex((p) => p.id === id);
            if (index !== -1) {
              this.pending.splice(index, 1);
            }
          }
        })
        .catch(() => {
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
