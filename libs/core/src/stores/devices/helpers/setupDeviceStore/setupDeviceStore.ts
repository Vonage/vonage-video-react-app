import { assertDevicesAPI } from '../../assertions';

/**
 * Pull devices lists and try to restore previous selected devices
 */
function setupDeviceStore(api: unknown) {
  assertDevicesAPI(api);

  // no support for media devices
  if (!globalThis.navigator.mediaDevices?.addEventListener) {
    console.warn('enumerateDevices() not supported.');
    return;
  }

  void api.actions.syncMediaDevicesInfo();

  const abortController = new AbortController();

  // keep all devices synced on devicechange event
  globalThis.navigator.mediaDevices.addEventListener(
    'devicechange',
    () => {
      void api.actions.syncMediaDevicesInfo();
    },
    abortController
  );

  return () => {
    abortController.abort();
  };
}

export default setupDeviceStore;
