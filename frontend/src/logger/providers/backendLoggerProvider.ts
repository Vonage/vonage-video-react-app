import type { LoggerProviderConfig } from '@common/logger';
import { BackendLogTransport } from '../transport';

export function createBackendLoggingProvider(): LoggerProviderConfig {
  const transport = new BackendLogTransport();

  return {
    verbose: false,
    log: (event: string, extra?: Record<string, unknown>) => transport.log(event, extra),
    reportError: (error: unknown, extra: Record<string, unknown>) =>
      transport.reportError(error, extra),
  };
}
