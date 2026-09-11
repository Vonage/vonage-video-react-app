import { EventEmitter } from 'node:events';
import defer from '@common/execution/defer';

/**
 * Waits for a specific event to be emitted from an event emitter.
 * Optionally, provide a spy function to be called when the event occurs.
 * @param {EventEmitter} eventEmitter - The event emitter to listen to.
 * @param {string} event - The name of the event to wait for.
 * @param {(...args: any[]) => void | undefined} eventSpy - An optional callback that will be invoked with the event arguments when the event is emitted.
 * @returns {Promise<void>} - A promise that resolves if the event is dispatched.
 */
const waitForEvent = async (
  eventEmitter: EventEmitter,
  event: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eventSpy?: (...args: any[]) => void
): Promise<void> => {
  const { promise, resolve } = defer<void>();
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

export default waitForEvent;
