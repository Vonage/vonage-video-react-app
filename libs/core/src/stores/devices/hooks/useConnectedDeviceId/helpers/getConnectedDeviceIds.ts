import type { DeviceKind } from '@core/stores/devices';
import getStorageItem from './getStorageItem';

const STORAGE_KEYS = {
  AUDIO_SOURCE: 'audioSource',
  VIDEO_SOURCE: 'videoSource',
} as const;

/**
 * Device store that retrieves the stored device ID for a given device type (audio or video)
 * and checks if it is still connected.
 */
function getConnectedDeviceIds(
  mediaDevices: MediaDeviceInfo[],
  kinds: DeviceKind[]
): string | null | (string | null)[] {
  const getKindId = (kind: DeviceKind): string | null => {
    const key = kind === 'videoinput' ? STORAGE_KEYS.VIDEO_SOURCE : STORAGE_KEYS.AUDIO_SOURCE;

    const storedId = getStorageItem(key);

    const deviceId: string | null =
      mediaDevices.find(
        (device) => device.kind === kind && (!storedId || device.deviceId === storedId)
      )?.deviceId ?? null;

    return deviceId;
  };

  const ids = kinds.map((kind) => getKindId(kind));

  return kinds.length === 1 ? ids[0] : ids;
}

export default getConnectedDeviceIds;
