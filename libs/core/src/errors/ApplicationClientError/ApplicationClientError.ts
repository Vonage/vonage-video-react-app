import { StatusCode } from 'status-code-enum';
import ApplicationError from '@common/errors/ApplicationError';
import type ClientErrorFallbackConfig from './types/ClientErrorFallbackConfig';
import { isRecord } from '@common/assertions';

class ApplicationClientError extends ApplicationError {
  public override type: string = 'error';

  constructor({
    src,
    fallbackConfig,
  }: {
    src: unknown;
    fallbackConfig: ClientErrorFallbackConfig;
  }) {
    super({
      src,
      fallbackConfig: {
        // client error do not have status code by default
        statusCode: -1 as unknown as StatusCode,
        ...fallbackConfig,
      },
    });

    /**
     * Api errors are safe to display as they are already mapped to have user-friendly messages.
     * The following code prevents treating the exception as unhandled which will hide the already safe message returned from the server.
     */
    const shouldAvoidHidingSafeError = isRecord(src) && src.type === 'server_error';
    if (!shouldAvoidHidingSafeError) return;

    const applicationError = src as Partial<ApplicationError>;

    this.type = applicationError.type ?? this.type;
    this.message = applicationError.message ?? this.message;
    this.fallbackConfig = {
      ...this.fallbackConfig,
      fallbackMessage: applicationError.fallbackMessage ?? this.message,
    };
  }
}

export default ApplicationClientError;
