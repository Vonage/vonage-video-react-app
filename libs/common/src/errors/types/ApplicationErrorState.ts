import type { ApplicationErrorFallbackConfig } from './ApplicationErrorFallbackConfig';

export type ApplicationErrorState = {
  message: string;

  /**
   * The stack trace of the error.
   * This is only included in development mode
   */
  stack?: string;

  /**
   * This includes the fallbackMessage and default error properties.
   */
  fallbackConfig: ApplicationErrorFallbackConfig;

  type?: string;

  name?: string;
} & Pick<ApplicationErrorFallbackConfig, 'severity' | 'issues' | 'statusCode'>;
