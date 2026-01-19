import mediaDevicesMock from '../../../mocks/mediaDevicesMock';
import permissionsMock from '../../../mocks/permissionsMock';

/**
 * Setup window.navigator APIs that are not available in jsdom.
 * Includes navigator.mediaDevices and navigator.permissions.
 */
function setupWindowNavigatorMock() {
  Object.assign(globalThis.navigator, {
    mediaDevices: mediaDevicesMock,
    permissions: permissionsMock,
  });
}

export default setupWindowNavigatorMock;
