import attempt from '@common/execution/attempt';
import type { DevicesApi, VonageAudioOutputDeviceId } from '@core/stores/devices';

/**
 * Syncs media devices and media selected device
 */
const syncMediaDevices = (
  actions: DevicesApi['actions'],
  deviceId: VonageAudioOutputDeviceId | undefined
) => {
  return actions.syncMediaDevicesList().then((devices) => {
    // return attempt(
    //   () => actions.setMediaDevice(deviceId ?? null),
    //   () => {
    //     const defaultDevice = devices.find((device) => device.deviceId === 'default');
    //     actions.setMediaDevice(defaultDevice?.deviceId ?? null);
    //   }
    // );
  });
};

export default syncMediaDevices;
