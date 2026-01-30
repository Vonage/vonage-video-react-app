import { LoggerFeature, type LoggerProviderConfig } from '@common/logger';

export function createConsoleLoggerProvider(): LoggerProviderConfig {
  return {
    [LoggerFeature.Log]: (event: string, extra?: Record<string, unknown>) => {
      console.info('[Logger] log: ', event, extra ?? {});
    },
    [LoggerFeature.ReportError]: (error: unknown, extra: Record<string, unknown> = {}) => {
      console.error('[Logger][ReportError]', error, extra);
    },
  };
}
