import StatusCodeEnum from 'status-code-enum';
import type { ErrorSeverity } from './ErrorSeverity';

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

  /**
   * Indicates if the error is recoverable.
   */
  recoverable?: boolean | null;
};
