import StatusCodeEnum from 'status-code-enum';

export type ErrorSeverity = 'critical' | 'validation' | 'error';

export type ApplicationErrorFallbackConfig = {
  /**
   * Message that will be shown to the user
   */
  fallbackMessage: string;

  /**
   * Collection of validation error values
   * This is used to group validation errors together
   */
  values?: string[];

  severity?: ErrorSeverity;

  /**
   * The HTTP status code associated with the error.
   */
  statusCode: StatusCodeEnum;
};

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
} & Pick<ApplicationErrorFallbackConfig, 'severity' | 'values' | 'statusCode'>;
