import { vi } from 'vitest';
import makeWindowNavigatorMock, { type NavigatorMock } from '../makeWindowNavigatorMock';

/**
 * Setup window.navigator APIs that are not available in jsdom.
 * Includes navigator.mediaDevices and navigator.permissions.
 */
function setupWindowNavigatorMock(mock?: NavigatorMock) {
  vi.stubGlobal('navigator', makeWindowNavigatorMock(mock || {}));
}

export default setupWindowNavigatorMock;
