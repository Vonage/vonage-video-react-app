/* eslint-disable @typescript-eslint/no-explicit-any */

const enqueue_symbol = Symbol('enqueue_symbol');

type QueueExtensions = {
  /**
   * Registers a callback to be executed when all previously enqueued promises have settled.
   * If the queue gets extended previously registered callbacks will be ignored.
   */
  afterAll: (cb: () => void) => void;

  /**
   * If present means this promise was queued.
   */
  [enqueue_symbol]?: true;
};

/**
 * Appends a promise-producing task after an existing promise.
 *
 * The task only runs after the previous promise resolves. If the previous
 * promise rejects, the queue rejects and the task is not executed.
 *
 * The returned promise includes `afterAll`, which runs a callback when the
 * queue drains, unless another task was appended after the callback was
 * registered.
 */
function enqueue<T extends Promise<any>>(
  promise: T | null | undefined,
  builder: () => T
): Promise<T> & QueueExtensions {
  const extendedTail = (promise ?? Promise.resolve()) as Promise<unknown> & QueueExtensions;
  const isAlreadyQueued = extendedTail?.[enqueue_symbol] === true;

  if (isAlreadyQueued) {
    throw new Error('Cannot enqueue a promise that is already queued.');
  }

  // Mark the returned promise as queued
  extendedTail[enqueue_symbol] = true;

  // uses then, so if the tail rejects the whole chain goes down, this is intended
  const queue = extendedTail.then(() => builder()) as Promise<T> & QueueExtensions;

  queue.afterAll = (callback: () => void) =>
    queue.then(() => {
      // If the queue was extended after registering the callback, ignore it
      const wasExtended = queue[enqueue_symbol];
      if (wasExtended) return;

      callback();
    });

  return queue;
}

export default enqueue;
