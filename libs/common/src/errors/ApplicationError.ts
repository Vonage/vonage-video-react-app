import StatusCodeEnum from 'status-code-enum';
import type { ApplicationErrorState, ApplicationErrorFallbackConfig, ErrorSeverity } from './types';
import mapSourceToState from './helpers/mapSourceToState';

class ApplicationError extends Error {
  public values: string[] = [];

  public severity: ErrorSeverity;

  public statusCode: StatusCodeEnum;

  public fallbackConfig: ApplicationErrorFallbackConfig;

  /**
   * Creates a new instance of the custom application error.
   * @param src - The source of the error, can be a string, an instance of `IApplicationError`, or an `Error` object.
   * @param fallbackConfig - In case the source is not an `IApplicationError`, this config will be used to create the error.
   */
  constructor({
    src,
    fallbackConfig,
  }: {
    src: unknown;
    fallbackConfig: ApplicationErrorFallbackConfig;
  }) {
    const state: Partial<ApplicationErrorState> & {
      message: string;
      fallbackConfig: ApplicationErrorFallbackConfig;
    } = {
      message: 'Internal server error',
      fallbackConfig,
      ...fallbackConfig,
      ...mapSourceToState(src),
    };

    /**
     * If the message is already in the values array
     * We replace it with the fallback message to provide more context and avoid redundancy.
     */
    const hasMessageRedundancy = state.message === state.values?.[0];
    const message = hasMessageRedundancy ? state.fallbackConfig.fallbackMessage : state.message;

    super(message);

    this.stack = state.stack ?? this.stack;
    this.severity = state.severity ?? 'error';
    this.values = state.values ?? [];
    this.fallbackConfig = state.fallbackConfig;
    this.statusCode = state.statusCode ?? StatusCodeEnum.ServerErrorInternal;
  }

  /**
   * Add a message to the error
   * @param message - The message to add
   * @param map - A map of values to replace in the message
   * @returns void
   *
   * @example
   * ```ts
   * error.add('The user {user} is not found', { user: 'john@gmail.com' });
   */
  add = (message: string, map?: Record<string, unknown>) => {
    if (!map) {
      this.values.push(message);

      return this;
    }

    this.values.push(
      message.replace(/{(\w+)}/g, (match, propName) => {
        const propValue = map[propName];
        if (propValue === undefined) return match;

        return match.toString();
      })
    );

    return this;
  };

  setStatusCode(statusCode: StatusCodeEnum): this {
    this.statusCode = statusCode;

    return this;
  }

  /**
   * Check if the custom validation has any violations and throw the error if it does.
   */
  assert = () => {
    if (this.values.length) throw this;
  };

  public exportSafely = () => {
    return this.exportSafelyBase();
  };

  public exportSafelyBase = (): {
    message: string;
    severity: ErrorSeverity;
    values?: string[];
    stack?: string;
    fallbackMessage?: string;
    statusCode: StatusCodeEnum;
  } => {
    const { fallbackConfig, message, severity, stack, values, statusCode } = this;

    // Prevent disclosure of private sensitive info
    if (globalThis.process?.env?.NODE_ENV === 'development') {
      return {
        fallbackMessage: fallbackConfig.fallbackMessage,
        message,
        severity,
        stack,
        values,
        statusCode,
      };
    }

    return {
      // prevent disclosing unhandled messages on production
      message: fallbackConfig.fallbackMessage,
      severity,
      values,
      statusCode,
    };
  };
}

export default ApplicationError;
