import type { Any } from '@common/types';

type ThrottleOptions = {
  leading?: boolean;
  trailing?: boolean;
};

/**
 * Rate-limits a function so it executes at most once per `wait` milliseconds.
 * Useful for high-frequency events (scroll, resize, mouse move) where executing on every
 * frame would degrade performance or flood a backend with redundant requests.
 *
 * By default both `leading` and `trailing` invocations are enabled — the first call fires
 * immediately, and if more calls arrive during the wait window, the last one fires after
 * the interval expires. Set `leading: false` to skip the immediate call, or `trailing: false`
 * to drop the deferred one.
 *
 * @param callback - The function to throttle.
 * @param wait - Minimum interval in milliseconds between executions.
 * @param options - Control leading/trailing behavior.
 * @param options.leading - Fire on the leading edge of the interval. Defaults to `true`.
 * @param options.trailing - Fire on the trailing edge of the interval. Defaults to `true`.
 * @returns A throttled version of the callback with the same parameter signature.
 */
function throttle<T extends (...args: Any[]) => void>(
  callback: T,
  wait: number,
  options: ThrottleOptions = {}
): (...args: Parameters<T>) => void {
  const { leading = true, trailing = true } = options;

  let trailingCallTimer: ReturnType<typeof setTimeout> | null = null;
  let latestTrailingArgs: Parameters<T> | null = null;
  let lastCallbackExecutionTime = 0;

  const executeCallback = (args: Parameters<T>) => {
    lastCallbackExecutionTime = Date.now();
    latestTrailingArgs = null;

    callback(...args);
  };

  const cancelTrailingCall = () => {
    if (!trailingCallTimer) return;

    clearTimeout(trailingCallTimer);
    trailingCallTimer = null;
  };

  const scheduleTrailingCall = (delay: number) => {
    if (trailingCallTimer) return;

    trailingCallTimer = setTimeout(() => {
      trailingCallTimer = null;

      if (latestTrailingArgs) {
        executeCallback(latestTrailingArgs);
      }
    }, delay);
  };

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastExecution = now - lastCallbackExecutionTime;
    const canExecuteImmediately = timeSinceLastExecution >= wait;

    if (canExecuteImmediately && leading) {
      cancelTrailingCall();
      executeCallback(args);
      return;
    }

    if (!trailing) return;

    latestTrailingArgs = args;

    const remainingWaitTime = canExecuteImmediately ? wait : wait - timeSinceLastExecution;

    scheduleTrailingCall(remainingWaitTime);
  };
}

export default throttle;
