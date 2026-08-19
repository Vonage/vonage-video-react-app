/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApplicationErrorFallbackConfig } from '@common/errors/types';
import isFunction from '@common/assertions/isFunction';
import isPromise from '@common/assertions/isPromise';
import ApplicationError, { isApplicationError } from '@common/errors';

export type ErrorProps = {
  fallbackConfig: ApplicationErrorFallbackConfig;
};

type AnyFunction = (...args: any[]) => any;

type BuilderSource = ErrorProps | ((error: any) => ApplicationError | ErrorProps);

/**
 * Ensures that any exception thrown by the callback is converted into a safe {@link ApplicationError}
 * with a user-facing fallback message — preventing raw errors from leaking sensitive details
 * (stack traces, internal state, credentials) to consumers or end users.
 *
 * Uses a static fallback config to build the ApplicationError on failure.
 * If the callback returns a Promise, error handling is applied to the rejection path.
 *
 * @param callback - The function to execute.
 * @param errorProps - Static error configuration with a safe fallback message and severity.
 * @returns The return value of the callback (or a Promise of it if the callback is async).
 */
function assertResult<T extends AnyFunction>(callback: T, errorProps: ErrorProps): ReturnType<T>;

/**
 * Ensures that any exception thrown by the callback is converted into a safe {@link ApplicationError}
 * with a user-facing fallback message — preventing raw errors from leaking sensitive details
 * (stack traces, internal state, credentials) to consumers or end users.
 *
 * Uses a dynamic builder that receives the caught error and returns either a fully constructed
 * ApplicationError or an ErrorProps object. This allows context-aware error mapping (e.g. different
 * messages for network vs validation errors) while still guaranteeing the output is safe.
 *
 * @param callback - The function to execute.
 * @param onErrorCallback - Receives the caught error and returns an ApplicationError or ErrorProps.
 * @returns The return value of the callback (or a Promise of it if the callback is async).
 */
function assertResult<T extends AnyFunction>(
  callback: T,
  onErrorCallback: (error: any) => ApplicationError | ErrorProps
): ReturnType<T>;

function assertResult<T extends AnyFunction>(
  callback: T,
  arg1: ErrorProps | ((error: any) => ApplicationError | ErrorProps)
): ReturnType<T> {
  const buildError = (error: BuilderSource | Error): ApplicationError => {
    const builder = isFunction(arg1) ? arg1 : () => arg1;
    const errorParameter = builder(error);

    if (isApplicationError(errorParameter)) return errorParameter;

    return new ApplicationError({
      src: error,
      fallbackConfig: errorParameter.fallbackConfig,
    });
  };

  try {
    const result = callback();

    if (isPromise(result)) {
      // @ts-expect-error TS cannot infer the type here
      return result.catch((error: BuilderSource | Error) => {
        throw buildError(error);
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result as ReturnType<T>;
  } catch (error) {
    throw buildError(error as Error);
  }
}

export default assertResult;
