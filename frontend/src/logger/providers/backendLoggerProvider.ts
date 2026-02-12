import type { LoggerProviderConfig } from '@common/logger';
import tryCatch from '@common/execution/tryCatch';
import { BackendLogTransport } from '../transport';
import { createClientEvent, parseExtra } from '../event';

export function createBackendLoggingProvider(): LoggerProviderConfig {
  const transport = new BackendLogTransport();

  return {
    verbose: false,

    log: (event: string, extra?: Record<string, unknown>) => {
      // Fire-and-forget: logging must not throw or block the UI; errors are intentionally swallowed.
      tryCatch(() => {
        const parsedExtra = parseExtra(extra);

        const clientEvent = createClientEvent({
          level: 'info',
          action: event,
          variation: 'Success',
          ...parsedExtra,
        });

        transport.send(clientEvent);
      });
    },

    reportError: (error: unknown, extra: Record<string, unknown>) => {
      // Fire-and-forget: logging must not throw or block the UI; errors are intentionally swallowed.
      tryCatch(() => {
        const parsedExtra = parseExtra(extra);

        const variation =
          error instanceof Error
            ? error.name
            : typeof error === 'object' && error !== null && 'name' in error
              ? String((error as { name: unknown }).name)
              : 'Error';

        const errorPayload = {
          error:
            error instanceof Error
              ? { message: error.message, name: error.name, stack: error.stack }
              : error,
          ...(parsedExtra.payload ?? {}),
        };

        const clientEvent = createClientEvent({
          level: 'error',
          action: 'Error',
          variation,
          payload: errorPayload,
          sessionId: parsedExtra.sessionId,
          connectionId: parsedExtra.connectionId,
          timestamp: parsedExtra.timestamp,
          partnerId: parsedExtra.partnerId,
        });

        transport.send(clientEvent);
      });
    },
  };
}
