import { StatusCode } from 'status-code-enum';
import type { ErrorSeverity } from './ErrorSeverity';
import { Any } from '@common/types';

export type ApplicationErrorFallbackConfig = {
  /**
   * Message that will be shown to the user
   */
  fallbackMessage: string;

  /**
   * Collection of validation error values
   * This is used to group validation errors together
   */
  issues?: Any[];

  severity?: ErrorSeverity;

  /**
   * The HTTP status code associated with the error.
   */
  statusCode: StatusCode;

  /**
   * Type of the error, used for categorization and handling logic.
   */
  type?: string;
};
