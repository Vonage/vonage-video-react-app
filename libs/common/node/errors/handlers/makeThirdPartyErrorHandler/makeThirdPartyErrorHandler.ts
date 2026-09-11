import { isErrorLike, isNil, isString } from '@common/assertions';
import { StatusCode } from 'status-code-enum';
import ApplicationServerError from '../../ApplicationServerError';
import type { Any } from '@common/types';

export type BuildThirdPartyErrorHandlerArgs = {
  fallbackMessage: string;
  /**
   * If true, maps the error message to the values of the application error.
   */
  mapThirdPartyErrors: boolean;
};

export type BuildThirdPartyErrorHandler = (error: Any) => ApplicationServerError;

export function buildThirdPartyErrorHandler(): BuildThirdPartyErrorHandler;

export function buildThirdPartyErrorHandler(fallbackMessage: string): BuildThirdPartyErrorHandler;

export function buildThirdPartyErrorHandler({
  fallbackMessage,
  mapThirdPartyErrors,
}: BuildThirdPartyErrorHandlerArgs): BuildThirdPartyErrorHandler;

export function buildThirdPartyErrorHandler(
  arg?: string | BuildThirdPartyErrorHandlerArgs
): BuildThirdPartyErrorHandler {
  const { fallbackMessage, mapThirdPartyErrors } = (() => {
    if (isNil(arg) || isString(arg)) {
      return {
        fallbackMessage: arg ?? 'Third party service error',
        mapThirdPartyErrors: true,
      };
    }

    return arg;
  })();

  return (error: Any) =>
    new ApplicationServerError({
      src: error,
      fallbackConfig: {
        fallbackMessage,
        statusCode: StatusCode.ServerErrorBadGateway,
        issues: mapThirdPartyErrors && isErrorLike(error) ? [error.message] : [],
      },
    });
}

export default buildThirdPartyErrorHandler;
