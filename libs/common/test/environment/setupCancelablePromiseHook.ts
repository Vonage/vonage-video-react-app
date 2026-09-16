import type * as LazyModule from 'easy-cancelable-promise';
import tryCatch from '../../src/execution/tryCatch';
import { createRequire } from 'node:module';
import { vi } from 'vitest';

const require = createRequire(import.meta.url);

const { result: module, error } = tryCatch(
  () => require('easy-cancelable-promise') as typeof LazyModule
);

export const cancelablePromiseTracker = vi.fn();

export const setupCancelablePromiseHook = () => {
  if (error || !module) return;

  const { CancelablePromise } = module;

  /**
   * Temporal monkey-patch of CancelablePromise to track promises that were canceled during tests.
   */
  CancelablePromise.prototype.cancel = function (this: LazyModule.CancelablePromise<unknown>) {
    cancelablePromiseTracker(this);
    return this;
  };
};

export default setupCancelablePromiseHook;
