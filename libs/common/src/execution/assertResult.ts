/* eslint-disable @typescript-eslint/no-explicit-any */
import { isPromise } from '@common/data/promises';
import { isFunction } from '@common/data/functions';
import isApplicationError from '@common/errors/isApplicationError';
import type { ApplicationErrorFallbackConfig } from '@common/errors/ApplicationError.types';
import ApplicationError from '../errors/ApplicationError';

export type ErrorProps = {
  fallbackConfig: ApplicationErrorFallbackConfig;
};

type BuilderSource = ErrorProps | ((error: any) => ApplicationError | ErrorProps);

type AssertResult<T> = T extends Promise<infer R> ? Promise<R> : T;

function assertResult<T>(callback: () => T | Promise<T>, error: ErrorProps): AssertResult<T>;

function assertResult<T>(
  callback: () => T | Promise<T>,
  onErrorCallback: (error: any) => ApplicationError | ErrorProps
): AssertResult<T>;

function assertResult<T>(
  callback: () => T | Promise<T>,
  arg1: ErrorProps | ((error: any) => ApplicationError | ErrorProps)
): AssertResult<T> {
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
      return result.catch((error) => {
        throw buildError(error);
      }) as AssertResult<T>;
    }

    return result as AssertResult<T>;
  } catch (error) {
    throw buildError(error as Error);
  }
}

export default assertResult;
