import isPromise from '@common/assertions/isPromise';

type ErrorCallback = (error: unknown) => void;

/**
 * Attempts to execute a callback function and handles any errors that may occur during its execution.
 *
 * @example
 * attempt(() => analytics.trackEvent('button_click'));
 */
function attempt(callback: () => Promise<void>, onError?: ErrorCallback): Promise<void>;

/**
 * Attempts to execute a callback function and handles any errors that may occur during its execution.
 *
 * @example
 * attempt(() => analytics.trackEvent('button_click'));
 */
function attempt(callback: () => void, onError?: ErrorCallback): void;

function attempt(
  callback: () => void | Promise<void>,
  onError?: ErrorCallback
): void | Promise<void> {
  try {
    const result = callback();

    if (isPromise(result)) {
      return result.catch((error) => {
        onError?.(error);
      });
    }
  } catch (error) {
    onError?.(error);
  }
}

export default attempt;
