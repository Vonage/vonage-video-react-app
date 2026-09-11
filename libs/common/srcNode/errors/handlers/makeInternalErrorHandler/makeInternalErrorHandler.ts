import { StatusCode } from 'status-code-enum';
import ApplicationServerError from '../../ApplicationServerError';
import type { Any } from '@common/types';
import type { ApplicationErrorFallbackConfig } from '../../types';
import { isFunction, isNil, isString } from '@common/assertions';

export function buildInternalErrorHandler(fallbackMessage?: string): InternalErrorHandler;

export function buildInternalErrorHandler(args: FallbackConfigArgs): InternalErrorHandler;

export function buildInternalErrorHandler(
  callback: (error: unknown) => FallbackConfigArgs
): InternalErrorHandler;

export function buildInternalErrorHandler(
  arg0?: string | FallbackConfigArgs | ((error: unknown) => FallbackConfigArgs)
): InternalErrorHandler {
  return (error: Any) => {
    const { fallbackMessage, issues } = (() => {
      if (isFunction(arg0)) return arg0(error);

      if (isString(arg0) || isNil(arg0)) {
        return {
          fallbackMessage: arg0 ?? 'An internal error occurred',
          issues: undefined,
        };
      }

      return arg0;
    })();

    return new ApplicationServerError({
      src: error,
      fallbackConfig: {
        fallbackMessage,
        statusCode: StatusCode.ServerErrorInternal,
        issues,
      },
    });
  };
}

type InternalErrorHandler = (error: Any) => ApplicationServerError;

type FallbackConfigArgs = Required<
  Pick<ApplicationErrorFallbackConfig, 'fallbackMessage' | 'issues'>
>;

export default buildInternalErrorHandler;
