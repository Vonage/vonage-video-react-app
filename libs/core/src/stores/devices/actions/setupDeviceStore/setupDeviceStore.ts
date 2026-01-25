import syncAudioOutputDevices from './helpers/syncAudioOutputDevices';
import syncMediaDevices from './helpers/syncMediaDevices';

export type DevicesApi = import('../../devicesStore').DevicesApi;

/**
 * onInit action DeviceStore setup
 */
function setupDeviceStore(api: unknown) {
  const { actions, getMetadata, getState } = api as DevicesApi;
  const metadata = getMetadata();

  // no support for media devices
  if (!globalThis.navigator.mediaDevices?.addEventListener) {
    console.warn('enumerateDevices() not supported.');
    return;
  }

  // Initial sync of all devices
  void actions.syncDevicesList();
  void syncMediaDevices(actions, undefined);
  void syncAudioOutputDevices(actions, metadata.restoredAudioOutput?.deviceId);

  const abortController = new AbortController();

  // keep all devices synced on devicechange event
  globalThis.navigator.mediaDevices.addEventListener(
    'devicechange',
    () => {
      const { selectedAudioOutput: audioOutput } = getState();

      void actions.syncDevicesList();
      void syncMediaDevices(actions, undefined);
      void syncAudioOutputDevices(actions, audioOutput?.deviceId);
    },
    abortController
  );

  return () => {
    abortController.abort();
  };
}

export default setupDeviceStore;
