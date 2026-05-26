import ApplicationError from '@common/errors/ApplicationError';
import type ClientErrorFallbackConfig from './types/ClientErrorFallbackConfig';
import { isErrorLike } from '@common/assertions';

class ApplicationClientError extends ApplicationError {
  public override type: string = 'error';

  constructor({
    src,
    fallbackConfig,
  }: {
    src: unknown;
    fallbackConfig: ClientErrorFallbackConfig;
  }) {
    const clientDefaults = {
      statusCode: -1,
      message: 'Unexpected error occurred.',
    };

    super({
      src,
      fallbackConfig: {
        ...clientDefaults,
        ...fallbackConfig,
      },
    });

    this.type = (() => {
      if (!isErrorLike(src)) return this.fallbackConfig.type ?? this.type;
      return (src as { type?: string }).type ?? this.fallbackConfig.type ?? this.type;
    })();

    if (this.type === 'server_error' && isErrorLike(src)) {
      // prevents hiding the original message behind the fallback message
      this.fallbackMessage = src.message;
    }

    const shouldAddDetails = !this.issues.length && this.fallbackMessage !== this.message;
    if (!shouldAddDetails) return;

    this.issues.push(this.message);
  }
}

export default ApplicationClientError;
