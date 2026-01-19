import { cleanup } from '@testing-library/react';
import { vi } from 'vitest';
import { setupCancelablePromiseHook, cancelablePromiseTracker } from '../../test/environment';

import {
  setupScrollIntoViewMock,
  setupResizeObserverMock,
  setupHtmlMediaElementGuards,
  setupHtmlCanvasElementGuards,
} from './helpers';

/**
 * Setup for FE environments
 * ```ts
 * setupWindowNavigatorMock();
 * setupResizeObserverMock();
 * setupScrollIntoViewMock();
 * setupHtmlMediaElementGuards();
 * setupHtmlCanvasElementGuards();
 * setupCancelablePromiseHook();
 * ```
 */
export const setupFrontendTestEnvironment = () => {
  setupResizeObserverMock();
  setupScrollIntoViewMock();
  setupHtmlMediaElementGuards();
  setupHtmlCanvasElementGuards();
  setupCancelablePromiseHook();
};

/**
 * Mandatory cleanups to enforce clean isolated test.
 * ```ts
 * cleanup();
 * vi.clearAllMocks();
 * vi.restoreAllMocks();
 * vi.unstubAllGlobals();
 * cancelablePromiseTracker.mockClear();
 * ```
 */
export const mandatoryAfterEachCleanup = () => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  cancelablePromiseTracker.mockClear();
};

export { cancelablePromiseTracker } from '../../test/environment';
