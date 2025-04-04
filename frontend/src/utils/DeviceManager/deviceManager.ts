/**
 * Device manager that retrieves the stored device ID for a given device type (audio or video)
 * and checks if it is still connected.
 */
export default class DeviceManager {
  private devices: MediaDeviceInfo[] = [];

  async init() {
    if (navigator.mediaDevices) {
      this.devices = await navigator.mediaDevices.enumerateDevices();
    }
  }

  getConnectedDeviceId(kind: 'audioinput' | 'videoinput'): string | undefined {
    const key = kind === 'videoinput' ? 'videoSource' : 'audioSource';
    const storedId = window.localStorage.getItem(key);
    return this.devices.find((device) => device.kind === kind && device.deviceId === storedId)
      ?.deviceId;
  }
}
