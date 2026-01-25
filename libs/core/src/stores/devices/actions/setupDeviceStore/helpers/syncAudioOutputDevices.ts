import attempt from '@common/execution/attempt';
import type { DevicesApi, VonageAudioOutputDeviceId } from '@core/stores/devices';

/**
 * Syncs audio output devices and audio output selected device
 */
const syncAudioOutputDevices = (
  actions: DevicesApi['actions'],
  deviceId: VonageAudioOutputDeviceId | undefined
) => {
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

export default syncAudioOutputDevices;
