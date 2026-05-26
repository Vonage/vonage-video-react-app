import { StatusCode } from 'status-code-enum';
import type { ApplicationErrorState, ApplicationErrorFallbackConfig, ErrorSeverity } from './types';
import mapSourceToState from './helpers/mapSourceToState';
import { Any } from '@common/types';
import { removeUndefinedProps } from '@common/helpers';

class ApplicationError extends Error {
  /**
   * An array to hold any specific issues related to the error, such as validation errors, zod issues etc
   */
  public issues: Any[] = [];

  public severity: ErrorSeverity;

  public statusCode: StatusCode;

  public fallbackConfig: ApplicationErrorFallbackConfig;

  /**
   * A string to categorize the error, useful for error tracking and analytics.
   */
  public type?: string;

  public get fallbackMessage() {
    return this.fallbackConfig.fallbackMessage;
  }

  public set fallbackMessage(message: string) {
    this.fallbackConfig.fallbackMessage = message;
  }

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
    const state: ApplicationErrorState & {
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
    const hasMessageRedundancy = state.message === state.issues?.[0];
    const message = hasMessageRedundancy ? state.fallbackConfig.fallbackMessage : state.message;

    super(message);

    this.stack = state.stack ?? this.stack;
    this.severity = state.severity ?? 'error';
    this.issues = state.issues ?? [];
    this.fallbackConfig = state.fallbackConfig;
    this.statusCode = state.statusCode ?? StatusCode.ServerErrorInternal;

    // optional properties
    this.name = state.name ?? this.constructor.name;
    this.type = state.type ?? this.fallbackConfig.type ?? this.type;
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
      this.issues.push(message);

      return this;
    }

    this.issues.push(
      message.replace(/{(\w+)}/g, (match, propName) => {
        const propValue = map[propName];
        if (propValue === undefined) return match;

        return match.toString();
      })
    );

    return this;
  };

  setStatusCode(statusCode: StatusCode): this {
    this.statusCode = statusCode;

    return this;
  }

  /**
   * Check if the custom validation has any violations and throw the error if it does.
   */
  assert = () => {
    if (this.issues.length) throw this;
  };

  public exportSafely = () => {
    return this.exportSafelyBase();
  };

  public exportSafelyBase = (): {
    message: string;
    severity: ErrorSeverity;
    issues?: string[];
    stack?: string;
    fallbackMessage?: string;
    statusCode: StatusCode;
    type: string | undefined;
    name: string;
  } => {
    const { fallbackConfig, message, severity, stack, statusCode, type, name } = this;

    const optionals = removeUndefinedProps({
      issues: this.issues.length ? this.issues : undefined,
      type,
    });

    // Prevent disclosure of private sensitive info
    if (globalThis.process?.env?.NODE_ENV === 'development') {
      return {
        name,
        fallbackMessage: fallbackConfig.fallbackMessage,
        message,
        severity,
        stack,
        statusCode,
        ...optionals,
      };
    }

    return {
      name,

      // prevent disclosing unhandled messages on production
      message: fallbackConfig.fallbackMessage,
      severity,
      statusCode,

      ...optionals,
    };
  };
}

export default ApplicationError;
