let cachedDevices: MediaDeviceInfo[] = [];

const updateDeviceList = async () => {
  cachedDevices = await navigator.mediaDevices.enumerateDevices();
};

const refreshDevices = () => {
  updateDeviceList();
  navigator.mediaDevices.addEventListener('devicechange', updateDeviceList);
};

refreshDevices();

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
