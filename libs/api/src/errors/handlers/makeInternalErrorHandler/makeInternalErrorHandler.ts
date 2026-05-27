import { StatusCode } from 'status-code-enum';
import ApplicationServerError from '../../ApplicationServerError';
import type { Any } from '@common/types';
import type { ApplicationErrorFallbackConfig } from '../../types';
import { isNil, isString } from '@common/assertions';

export function buildInternalErrorHandler(fallbackMessage?: string): InternalErrorHandler;

export function buildInternalErrorHandler(args: FallbackConfigArgs): InternalErrorHandler;

export function buildInternalErrorHandler(
  argsOrMessage?: string | FallbackConfigArgs
): InternalErrorHandler {
  const { fallbackMessage, issues } = (() => {
    if (isString(argsOrMessage) || isNil(argsOrMessage)) {
      return {
        fallbackMessage: argsOrMessage ?? 'An internal error occurred',
        issues: undefined,
      };
    }

    return argsOrMessage;
  })();

  return (error: Any) =>
    new ApplicationServerError({
      src: error,
      fallbackConfig: {
        fallbackMessage,
        statusCode: StatusCode.ServerErrorInternal,
        issues,
      },
    });
}

type InternalErrorHandler = (error: Any) => ApplicationServerError;

type FallbackConfigArgs = Required<
  Pick<ApplicationErrorFallbackConfig, 'fallbackMessage' | 'issues'>
>;

export default buildInternalErrorHandler;
