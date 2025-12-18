import StatusCodeEnum from 'status-code-enum';
import isErrorLike from '@common/helpers/data/errors';
import { isString } from '@common/helpers/data/strings';
import { isNil } from '@common/helpers/data/nils';
import ApplicationServerError from '../ApplicationServerError';

export type BuildThirdPartyErrorHandlerArgs = {
  fallbackMessage: string;
  /**
   * If true, maps the error message to the values of the application error.
   */
  mapThirdPartyErrors: boolean;
};

export type BuildThirdPartyErrorHandler = (
  error: any
) => ApplicationServerError;

export function buildThirdPartyErrorHandler(): BuildThirdPartyErrorHandler;

export function buildThirdPartyErrorHandler(
  fallbackMessage: string
): BuildThirdPartyErrorHandler;

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

  return (error: any) =>
    new ApplicationServerError({
      src: error,
      fallbackConfig: {
        fallbackMessage,
        statusCode: StatusCodeEnum.ServerErrorBadGateway,
        values:
          mapThirdPartyErrors && isErrorLike(error) ? [error.message] : [],
      },
    });
}

export default buildThirdPartyErrorHandler;
