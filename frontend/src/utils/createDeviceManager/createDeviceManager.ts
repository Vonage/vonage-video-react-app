export type DeviceManagerType = {
  getConnectedDeviceId: (kind: 'videoinput' | 'audioinput') => Promise<string | undefined>;
};

/**
 * Device manager that retrieves the stored device ID for a given device type (audio or video)
 * and checks if it is still connected.
 * @returns {DeviceManagerType} device manager that updates the current device list and checks whether a particular device is still connected
 */
const createDeviceManager = (): DeviceManagerType => {
  let cachedDevices: MediaDeviceInfo[] = [];

  // Updates the device list by fetching connected devices
  const updateDeviceList = async () => {
    if (navigator.mediaDevices) {
      cachedDevices = await navigator.mediaDevices.enumerateDevices();
    }
  };

  // Retrieves the stored device ID for the given kind and checks if it's still connected
  const getConnectedDeviceId = async (
    kind: 'videoinput' | 'audioinput'
  ): Promise<string | undefined> => {
    await updateDeviceList();
    const storageKey = kind === 'videoinput' ? 'videoSource' : 'audioSource';
    const storedDeviceId = window.localStorage.getItem(storageKey);

    if (!storedDeviceId) {
      return undefined;
    }

    const isStillConnected = cachedDevices.some(
      (device) => device.deviceId === storedDeviceId && device.kind === kind
    );

    return isStillConnected ? storedDeviceId : undefined;
  };

  return { getConnectedDeviceId };
};

export default createDeviceManager;
