import { LoggerBase, type LoggerProviderConfig } from '@common/logger';
import logOnConnect from '@utils/logOnConnect';
import type { ErrorInfo } from 'react-dom/client';

export type FrontendLoggerProviderConfig = LoggerProviderConfig & {
  onCaughtError?: (error: Error, errorInfo: { componentStack?: string }) => void;
  onUncaughtError?: (error: Error, errorInfo: { componentStack?: string }) => void;
  onRecoverableError?: (error: Error, errorInfo: ErrorInfo) => void;
};

/**
 * FrontendLogger extends LoggerBase with React error callbacks (onCaughtError, onUncaughtError, onRecoverableError).
 * Logs are sent via the configured provider (e.g. backend → Gollum); not to the console.
 */
export class FrontendLogger extends LoggerBase {
  public shouldLogKibana(event: string, extra?: Record<string, unknown>): boolean {
    return event === 'EnterMeeting' && extra?.eventSource === 'vonageVideoClient.connect.success';
  }

  public override log(event: string, extra?: Record<string, unknown>): void {
    super.log(event, extra);

    if (this.shouldLogKibana(event, extra)) {
      logOnConnect(
        extra?.partnerId as string,
        extra?.sessionId as string,
        extra?.connectionId as string
      );
    }
  }

  public onCaughtError = (error: unknown, errorInfo: { componentStack?: string }) => {
    this.reportError(error, {
      type: 'caught',
      componentStack: errorInfo.componentStack,
    });
  };

  public onUncaughtError = (error: unknown, errorInfo: { componentStack?: string }) => {
    this.reportError(error, {
      type: 'uncaught',
      componentStack: errorInfo?.componentStack,
    });
  };

  public onRecoverableError = (error: unknown, errorInfo: ErrorInfo) => {
    this.reportError(error, {
      type: 'recoverable',
      componentStack: errorInfo?.componentStack,
    });
  };
}
