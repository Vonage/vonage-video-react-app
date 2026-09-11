import { vi } from 'vitest';

/**
 * Guard HTMLCanvasElement methods (getContext, toBlob) for jsdom environment.
 * These methods are not implemented in jsdom and will throw errors if called.
 * This guard ensures tests fail explicitly when these methods are invoked,
 * prompting developers to mock them properly in their tests.
 */
function setupHtmlCanvasElementGuards() {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => {
    throw new Error(
      'HTMLCanvasElement.getContext() was called during a test. ' +
        'This method is not implemented in jsdom. ' +
        'Mock or spy on it explicitly and assert the expected behavior.'
    );
  }) as unknown as typeof HTMLCanvasElement.prototype.getContext;

  HTMLCanvasElement.prototype.toBlob = vi.fn(() => {
    throw new Error(
      'HTMLCanvasElement.toBlob() was called during a test. ' +
        'This method is not implemented in jsdom. ' +
        'Mock or spy on it explicitly and assert the expected behavior.'
    );
  }) as unknown as typeof HTMLCanvasElement.prototype.toBlob;
}

export default setupHtmlCanvasElementGuards;
