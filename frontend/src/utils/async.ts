import { EventEmitter } from 'events';

/**
 * Waits for a specified of time
 * @param {number} delayMs - the number of milliseconds to wait
 * @returns {Promise<void>} a promise that resolves after the delay has elapsed
 */
export const delay = (delayMs: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delayMs);
  });

export type GetExternalPromiseResolverType = {
  promise: Promise<unknown>;
  resolve: () => void;
};
/**
 * Creates a promise that can be resolved externally.
 * @returns {GetExternalPromiseResolverType} - An object containing the promise to be resolved and the promise resolver.
 */
export const getExternalPromiseResolver = (): GetExternalPromiseResolverType => {
  let resolver: (value: unknown) => void;
  const promise = new Promise((resolve) => {
    resolver = resolve;
  });
  return {
    promise,
    // @ts-expect-error ts thinks this is used before assigned
    resolve: resolver,
  };
};

/**
 * Waits for a specific event to be emitted from an event emitter.
 * Optionally, provide a spy function to be called when the event occurs.
 * @param {EventEmitter} eventEmitter - The event emitter to listen to.
 * @param {string} event - The name of the event to wait for.
 * @param {(...args: any[]) => void | undefined} eventSpy - An optional callback that will be invoked with the event arguments when the event is emitted.
 * @returns {Promise<void>} - A promise that resolves if the event is dispatched.
 */
export const waitForEvent = async (
  eventEmitter: EventEmitter,
  event: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eventSpy?: (...args: any[]) => void
): Promise<void> => {
  const { promise, resolve } = getExternalPromiseResolver();
  const handler = (...args: unknown[]) => {
    if (eventSpy) {
      eventSpy(...args);
    }
    eventEmitter.off(event, handler);
    resolve();
  };
  eventEmitter.on(event, handler);
  await promise;
};
