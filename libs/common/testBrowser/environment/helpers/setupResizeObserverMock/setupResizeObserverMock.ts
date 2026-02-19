import resizeObserverMock from './mocks/resizeObserverMock';

/**
 * Setup ResizeObserver for jsdom environment.
 * ResizeObserver is not available in jsdom.
 */
function setupResizeObserverMock() {
  Object.assign(globalThis, {
    // 100% compatible polyfill
    ResizeObserver: resizeObserverMock,
  });
}

export default setupResizeObserverMock;
