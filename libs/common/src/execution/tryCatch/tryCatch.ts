/* eslint-disable @typescript-eslint/no-explicit-any */
import isPromise from '@common/assertions/isPromise';

type TryCatchResult<
  T extends (...args: any) => any,
  Fallback extends ReturnType<T> | undefined,
> = T extends () => Promise<infer R>
  ? Promise<{ result: Fallback extends undefined ? R | null : NonNullable<R>; error: any }>
  : {
      result: Fallback extends undefined ? ReturnType<T> | null : NonNullable<ReturnType<T>>;
      error: any;
    };

type AnyFunction = (...args: any[]) => any;

/**
 * Lineal try/catch function.
 *
 * If the callback is synchronous, it returns an object: `{ result, error }`.
 * If the callback returns a promise, it returns a promise that resolves to: `{ result, error }`.
 *
 * @template T
 * @param {() => T | Promise<T>} callback - The function to execute.
 * @returns {{ result: T | null, error: any } | Promise<{ result: T | null, error: any }>}
 */
function tryCatch<T extends AnyFunction, Fallback extends Awaited<ReturnType<T>> | undefined>(
  callback: T,
  fallback?: Fallback
): TryCatchResult<T, Fallback> {
  try {
    const result = callback();

    if (isPromise(result)) {
      return result
        .then((res) => ({ result: res, error: null }))
        .catch((error) => ({ result: fallback ?? null, error })) as TryCatchResult<T, Fallback>;
    }

    return { result, error: null } as TryCatchResult<T, Fallback>;
  } catch (error) {
    return { result: fallback ?? null, error } as TryCatchResult<T, Fallback>;
  }
}

export default tryCatch;
