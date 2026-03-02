import { CancelablePromise } from 'easy-cancelable-promise';
import { vi } from 'vitest';

export const cancelablePromiseTracker = vi.fn();

export const setupCancelablePromiseHook = () => {
  /**
   * Temporal monkey-patch of CancelablePromise to track promises that were canceled during tests.
   */
  CancelablePromise.prototype.cancel = function (this: CancelablePromise<unknown>) {
    cancelablePromiseTracker(this);
    return this;
  };
};

export default setupCancelablePromiseHook;
