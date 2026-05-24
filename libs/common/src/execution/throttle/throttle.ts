import type { Any } from '@common/types';

type ThrottleOptions = {
  leading?: boolean;
  trailing?: boolean;
};

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
