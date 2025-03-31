let cachedDevices: MediaDeviceInfo[] = [];

const updateDeviceList = async () => {
  cachedDevices = await navigator.mediaDevices.enumerateDevices();
};

const refreshDevices = () => {
  updateDeviceList();
  navigator.mediaDevices.addEventListener('devicechange', updateDeviceList);
};

refreshDevices();

/**
 * Retrieves the stored device ID for a given device type (audio or video)
 * and checks if it is still connected.
 * This function is intentionally synchronous to avoid forcing async behavior as it introduces some
 * inconsistent behavior where it is used. To achieve this, we maintain a cached list of devices that is updated asynchronously.
 * @param {'audio' | 'video'} kind - the type of the device to check - audio or video.
 * @returns {string | undefined} deviceId if still connected; undefined otherwise.
 */
const getConnectedDeviceId = (kind: 'audioinput' | 'videoinput'): string | undefined => {
  const storageKey = kind === 'audioinput' ? 'audioSource' : 'videoSource';
  const deviceId = window.localStorage.getItem(storageKey);

  if (!deviceId) {
    return undefined;
  }

  const isConnected = cachedDevices.some(
    (device) => device.kind === kind && device.deviceId === deviceId
  );

  return isConnected ? deviceId : undefined;
};

export default getConnectedDeviceId;
