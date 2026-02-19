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

function assertResult<T extends AnyFunction>(callback: T, error: ErrorProps): ReturnType<T>;

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
