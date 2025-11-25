import { getStorageItem, STORAGE_KEYS } from '../storage';

/**
 * Device store that retrieves the stored device ID for a given device type (audio or video)
 * and checks if it is still connected.
 */
export default class DeviceStore {
  private devices: MediaDeviceInfo[] = [];

  async init() {
    if (navigator.mediaDevices) {
      this.devices = await navigator.mediaDevices.enumerateDevices();
    }
  }

  getConnectedDeviceId(kind: 'audioinput' | 'videoinput'): string | undefined {
    const key = kind === 'videoinput' ? STORAGE_KEYS.VIDEO_SOURCE : STORAGE_KEYS.AUDIO_SOURCE;

    const storedId = getStorageItem(key);

    return this.devices.find(
      (device) => device.kind === kind && (!storedId || device.deviceId === storedId)
    )?.deviceId;
  }
}
