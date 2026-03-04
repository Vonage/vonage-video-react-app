import { isNotNil, isRecord } from '@common/assertions';
import ApplicationError from '@common/errors/ApplicationError';
import type { ApplicationErrorFallbackConfig } from '@common/errors/types';

/**
 * Constructor for server-specific `ApplicationError`.
 */
export class ApplicationServerError extends ApplicationError {
  public readonly src: unknown;

  constructor({
    src,
    fallbackConfig,
  }: {
    src: unknown;
    fallbackConfig: ApplicationErrorFallbackConfig;
  }) {
    super({ src, fallbackConfig });

    /**
     * Keep a reference to the original error
     *
     * The record validation avoids endless recursion in case src is an ApplicationError
     */
    this.src = isRecord(src) && isNotNil(src.src) ? src.src : src;
  }

  /**
   * Extracts and returns detailed information from the error for logging purposes.
   */
  public retrieveErrorLogDetails = () => {
    const { fallbackConfig, message, severity, stack, values, statusCode, src } = this;

    const details = {
      fallbackConfig,
      message,
      severity,
      stack,
      values,
      statusCode,

      // [TODO]: check if will use this as in the playground
      //  baseURL,
      // data,
      // method,
      // status,
      // statusText,
      // url,
      src: {
        ...(src || {}),
      },
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
