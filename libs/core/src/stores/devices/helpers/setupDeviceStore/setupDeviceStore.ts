import { assertDevicesAPI } from '../../assertions';
import internalActions from './actions';

/**
 * Pull devices lists and try to restore previous selected devices
 */
function setupDeviceStore(api: unknown) {
  assertDevicesAPI(api);

  const { syncDevicesList, syncMediaDevicesList, syncAudioOutputDevicesList } =
    internalActions(api);

  // no support for media devices
  if (!globalThis.navigator.mediaDevices?.addEventListener) {
    console.warn('enumerateDevices() not supported.');
    return;
  }

  // Initial sync of all devices
  void syncDevicesList();
  void syncMediaDevicesList();
  void syncAudioOutputDevicesList();

  const abortController = new AbortController();

  // keep all devices synced on devicechange event
  globalThis.navigator.mediaDevices.addEventListener(
    'devicechange',
    () => {
      void syncDevicesList();
      void syncMediaDevicesList();
      void syncAudioOutputDevicesList();
    },
    abortController
  );

  return () => {
    abortController.abort();
  };
}

export default setupDeviceStore;
