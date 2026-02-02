const getMediaDeviceInfoByKind = ({ mediaDeviceInfo }: { mediaDeviceInfo: MediaDeviceInfo[] }) => {
  return mediaDeviceInfo.reduce(
    (acc, device) => {
      const devices = acc[device.kind] || {
        default: device,
      };

      devices[device.deviceId] = device;
      acc[device.kind] = devices;

      return acc;
    },
    {} as Record<MediaDeviceKind, Record<string, MediaDeviceInfo>>
  );
};

export default getMediaDeviceInfoByKind;
