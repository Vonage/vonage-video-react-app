import { ApplicationServerError } from '../errors';
import type { ApplicationErrorFallbackConfig } from '@common/errors';
import { assertResult as assertResultBase } from '@common/execution';
import type { Any } from '@common/types';

type ErrorProps = {
  fallbackConfig: ApplicationErrorFallbackConfig;
};

type AssertResult<T extends () => Any> = T extends () => Promise<infer R>
  ? Promise<NonNullable<R>>
  : ReturnType<NonNullable<T>>;

/**
 * Asserts the result of a callback function,
 * If an error occurs, it builds an `ApplicationServerError` with the provided fallback configuration.
 * statusCode is required
 */
function assertResult<T extends () => Any>(callback: T, error: ErrorProps): AssertResult<T>;

function assertResult<T extends () => Any>(
  callback: T,
  onErrorCallback: (error: Any) => ApplicationServerError | ErrorProps
): AssertResult<T>;

function assertResult<T extends () => Any>(
  callback: T,
  arg1: ErrorProps | ((error: Any) => ApplicationServerError | ErrorProps)
): AssertResult<T> {
  return assertResultBase(
    callback,
    arg1 as Parameters<typeof assertResultBase>[1]
  ) as AssertResult<T>;
}

export default assertResult;
