import ApplicationError from '@common/errors/ApplicationError';
import type { ApplicationErrorFallbackConfig } from '@common/errors/types';
import { isHttpErrorLike } from './assertions';
import type { HttpErrorLike } from './types';
import { removeUndefinedProps } from '@common/helpers';

/**
 * Constructor for server-specific `ApplicationError`.
 */
export class ApplicationServerError extends ApplicationError {
  /**
   * The HTTP response associated with the error, if available.
   */
  public response?: HttpErrorLike['response'];

  /**
   * The HTTP request configuration associated with the error, if available.
   */
  public config?: HttpErrorLike['config'];

  /**
   * The error code associated with the HTTP error, if available.
   */
  public code?: HttpErrorLike['code'];

  public override type = 'server_error';

  constructor({
    src,
    fallbackConfig,
  }: {
    src: unknown;
    fallbackConfig: ApplicationErrorFallbackConfig;
  }) {
    super({ src, fallbackConfig });

    if (!isHttpErrorLike(src)) return;

    const { response, code, config } = src;

    const { body, bodyUsed, headers, ok, redirected, size, status, statusText, timeout, url } =
      response;

    const { data, headers: configHeaders, method, type, url: configUrl } = config;

    this.response = {
      body,
      bodyUsed,
      headers,
      ok,
      redirected,
      size,
      status,
      statusText,
      timeout,
      url,
    };

    this.config = { data, headers: configHeaders, method, type, url: configUrl };
    this.code = code;

    this.setStatusCode(status);
  }

  /**
   * Extracts and returns detailed information from the error for logging purposes.
   */
  public retrieveErrorLogDetails = () => {
    const {
      fallbackConfig,
      issues,
      message,
      name,
      severity,
      stack,
      statusCode,
      code,
      config: { data, headers: configHeaders, method, type, url: configUrl } = {},
      response: {
        body,
        bodyUsed,
        headers,
        ok,
        redirected,
        size,
        status,
        statusText,
        timeout,
        url,
      } = {},
    } = this;

    const details = {
      body,
      bodyUsed,
      code,
      configHeaders,
      configUrl,
      data,
      fallbackConfig,
      headers,
      issues,
      message,
      method,
      name,
      ok,
      redirected,
      response: !!this.response,
      severity,
      size,
      stack,
      status,
      statusCode,
      statusText,
      timeout,
      type,
      url,
    };

    return details;
  };

  public override exportSafely = () => {
    const { statusText, url } = this.response ?? {};
    const { method } = this.config ?? {};

    return {
      ...this.exportSafelyBase(),
      ...removeUndefinedProps({
        method,
        statusText,
        url,
      }),
      serverError: true,
    };
  };
}

export default ApplicationServerError;
