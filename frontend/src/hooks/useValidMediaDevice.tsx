import { useState, useEffect } from 'react';

const useValidMediaDevice = (deviceId: string | null, kind: string) => {
  const [validDevice, setValidDevice] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!deviceId) {
      setValidDevice(undefined);
      return;
    }

    const checkDevice = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const isDeviceConnected = devices
        .filter((device) => device.kind === kind)
        .some((device) => device.deviceId === deviceId);

      setValidDevice(isDeviceConnected ? deviceId : undefined);
    };

    checkDevice();
  }, [deviceId, kind]);

  return validDevice;
};

export default useValidMediaDevice;
