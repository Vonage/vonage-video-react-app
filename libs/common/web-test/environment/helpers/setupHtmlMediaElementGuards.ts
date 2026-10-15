import { vi } from 'vitest';

/**
 * Guard HTMLMediaElement methods (play, pause, load) for jsdom environment.
 * These methods are not implemented in jsdom and will throw errors if called.
 * This guard ensures tests fail explicitly when these methods are invoked,
 * prompting developers to mock them properly in their tests.
 */
function setupHtmlMediaElementGuards() {
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value: vi.fn(() => {
      throw new Error(
        'HTMLMediaElement.play() was called during a test. ' +
          'This method is not implemented in jsdom. ' +
          'Mock or spy on it explicitly and assert the expected behavior.'
      );
    }),
  });

  Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    value: vi.fn(() => {
      throw new Error(
        'HTMLMediaElement.pause() was called during a test. ' +
          'This method is not implemented in jsdom. ' +
          'Mock or spy on it explicitly and assert the expected behavior.'
      );
    }),
  });

  Object.defineProperty(HTMLMediaElement.prototype, 'load', {
    configurable: true,
    value: vi.fn(() => {
      throw new Error(
        'HTMLMediaElement.load() was called during a test. ' +
          'This method is not implemented in jsdom. ' +
          'Mock or spy on it explicitly and assert the expected behavior.'
      );
    }),
  });
}

export default setupHtmlMediaElementGuards;
