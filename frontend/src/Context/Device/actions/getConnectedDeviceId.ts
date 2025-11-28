import { STORAGE_KEYS, getStorageItem } from '@utils/storage';

export type DevicesApi = import('../DevicesContext').DevicesApi;

export type DeviceKind = 'audioinput' | 'videoinput';

/**
 * Device store that retrieves the stored device ID for a given device type (audio or video)
 * and checks if it is still connected.
 */
function getConnectedDeviceId(this: DevicesApi['actions'], kind: DeviceKind) {
  return async ({ getMetadata }: DevicesApi): Promise<string | null> => {
    const meta = getMetadata();

    if (meta.loadingMediaDevices) {
      await meta.loadingMediaDevices;
    }

    const key = kind === 'videoinput' ? STORAGE_KEYS.VIDEO_SOURCE : STORAGE_KEYS.AUDIO_SOURCE;

    const storedId = getStorageItem(key);

    const deviceId: string | null =
      meta.mediaDevices.find(
        (device) => device.kind === kind && (!storedId || device.deviceId === storedId)
      )?.deviceId ?? null;

    return deviceId;
  };
}

export default getConnectedDeviceId;
