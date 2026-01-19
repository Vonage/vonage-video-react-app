import isPromise from '@common/assertions/isPromise';

type AnyCallback = () => void | Promise<void>;

/**
 * Attempts to execute a callback function and handles any errors that may occur during its execution.
 *
 * @example
 * attempt(() => analytics.trackEvent('button_click'));
 */
function attempt<T extends AnyCallback>(
  callback: T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError?: (error: any) => void
): ReturnType<T> {
  try {
    const result = callback();

    if (isPromise(result)) {
      result.catch((error) => {
        onError?.(error);
      });
    }
  } catch (error) {
    onError?.(error);
  }

  return undefined as ReturnType<T>;
}

export default attempt;
