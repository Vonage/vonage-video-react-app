import ApplicationError from '@common/errors/ApplicationError';
import type { ApplicationErrorFallbackConfig } from '@common/errors/types';

/**
 * Constructor for server-specific `ApplicationError`.
 */
export class ApplicationServerError extends ApplicationError {
  constructor({
    src,
    fallbackConfig,
  }: {
    src: unknown;
    fallbackConfig: ApplicationErrorFallbackConfig;
  }) {
    super({ src, fallbackConfig });
  }

  /**
   * Extracts and returns detailed information from the error for logging purposes.
   */
  public retrieveErrorLogDetails = () => {
    const { fallbackConfig, message, severity, stack, issues, statusCode, name } = this;

    const details = {
      fallbackConfig,
      message,
      severity,
      stack,
      issues,
      statusCode,
      name,

      // [TODO]: check if will use this as in the playground
      //  baseURL,
      // data,
      // method,
      // status,
      // statusText,
      // url,
    };

    return details;
  };

  public override exportSafely = () => {
    return {
      ...this.exportSafelyBase(),
    };
  };
}

export default ApplicationServerError;
