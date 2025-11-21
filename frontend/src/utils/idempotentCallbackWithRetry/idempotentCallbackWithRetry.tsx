type RetryOptions = {
  retries?: number;
  delayMs?: number;
  onRetry?: (error: unknown, attempt: number) => void;
};

export const wait = (delay: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, delay);
  });

/**
 * Executes an idempotent asynchronous callback with retry logic.
 * @param {() => Promise<any>} callback - The asynchronous callback to execute.
 * @param {RetryOptions} options - Configuration options for retries.
 * @returns {Promise<any>} The result of the successful callback execution.
 * @throws Will throw the last encountered error if all retries fail.
 */
async function idempotentCallbackWithRetry<T>(
  callback: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { retries = 2, delayMs = 200, onRetry } = options;

  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retries) {
    try {
      return await callback();
    } catch (error) {
      lastError = error;
      if (attempt === retries) {
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
