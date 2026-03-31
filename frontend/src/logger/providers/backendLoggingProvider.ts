import type { LoggerProviderConfig } from '@common/logger';
import { BackendLogTransport } from '../transport';

export class BackendLoggingProvider implements LoggerProviderConfig {
  private readonly transport = new BackendLogTransport();

  verbose = false;
  log = (...args: Parameters<BackendLogTransport['log']>) => this.transport.log(...args);
  reportError = (...args: Parameters<BackendLogTransport['reportError']>) =>
    this.transport.reportError(...args);
}
