import attempt from '@common/execution/attempt';
import type { AudioOutputDeviceId } from '../schemas/AudioOutputDevice.schema';

export type DevicesApi = import('../DevicesStore').DevicesApi;

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

  /**
   * Syncs audio output devices and audio output selected device
   */
  const syncAudioOutputDevices = (deviceId: AudioOutputDeviceId | undefined) => {
    return actions.syncAudioOutputDevicesList().then((devices) => {
      return attempt(
        () => actions.setAudioOutputDevice(deviceId ?? null),
        () => {
          const defaultDevice = devices.find((device) => device.deviceId === 'default');
          actions.setAudioOutputDevice(defaultDevice?.deviceId ?? null);
        }
      );
    });
  };

  // keep all devices synced on devicechange event
  globalThis.navigator.mediaDevices.addEventListener('devicechange', () => {
    const { audioOutput } = getState();

    void actions.syncDevicesList();
    void actions.syncMediaDevicesList();
    void syncAudioOutputDevices(audioOutput?.deviceId);
  });

  // Initial sync of all devices
  void actions.syncDevicesList();
  void actions.syncMediaDevicesList();
  void syncAudioOutputDevices(metadata.restoredAudioOutput?.deviceId);
}

export default setupDeviceStore;
