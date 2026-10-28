import wait from '../wait';

type RetryOptions = {
  retries?: number;
  delayMs?: number;
  onRetry?: (error: unknown, attempt: number) => void;
};

/**
 * Executes an idempotent asynchronous callback with retry logic.
 * @param callback - The asynchronous callback to execute.
 * @param options - Configuration options for retries.
 * @param options.retries - Number of retry attempts after the initial attempt (default: 4).
 *                          Total attempts = retries + 1. Example: retries=4 means up to 5 total attempts.
 * @param options.delayMs - Delay in milliseconds between retry attempts (default: 600).
 * @param options.onRetry - Optional callback invoked on each retry with the error and attempt number.
 * @returns The result of the successful callback execution.
 * @throws Will throw the last encountered error if all retries fail.
 * @example
 * // Will attempt up to 3 times (1 initial + 2 retries)
 * await idempotentCallbackWithRetry(() => fetchData(), { retries: 2 });
 */
async function idempotentCallbackWithRetry<T>(
  callback: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { retries = 4, delayMs = 600, onRetry } = options;
  const maxAttempts = retries + 1;

  let attempt = 1;
  let lastError: unknown;

  while (attempt <= maxAttempts) {
    try {
      return await callback();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) {
        break;
      }
      onRetry?.(error, attempt);
      await wait(delayMs);
      attempt += 1;
    }
  }

  throw lastError;
}

export default idempotentCallbackWithRetry;
