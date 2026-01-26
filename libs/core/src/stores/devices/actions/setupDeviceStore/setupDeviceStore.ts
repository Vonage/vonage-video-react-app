import type { DevicesApiPrivate } from '../../types';

/**
 * Pull devices lists and try to restore previous selected devices
 */
function setupDeviceStore(api: unknown) {
  const { actions } = api as DevicesApiPrivate;

  // no support for media devices
  if (!globalThis.navigator.mediaDevices?.addEventListener) {
    console.warn('enumerateDevices() not supported.');
    return;
  }

  // Initial sync of all devices
  void actions.syncDevicesList();
  void actions.syncMediaDevicesList();
  void actions.syncAudioOutputDevicesList();

  const abortController = new AbortController();

  // keep all devices synced on devicechange event
  globalThis.navigator.mediaDevices.addEventListener(
    'devicechange',
    () => {
      void actions.syncDevicesList();
      void actions.syncMediaDevicesList();
      void actions.syncAudioOutputDevicesList();
    },
    abortController
  );

  return () => {
    abortController.abort();
  };
}

export default setupDeviceStore;
