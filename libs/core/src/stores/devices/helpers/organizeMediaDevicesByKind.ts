const organizeMediaDevicesByKind = ({
  mediaDeviceInfo,
}: {
  mediaDeviceInfo: MediaDeviceInfo[];
}) => {
  return mediaDeviceInfo.reduce(
    (acc, device) => {
      const devices = acc[device.kind] || {
        default: device,
      };

      devices[device.deviceId] = device;
      acc[device.kind] = devices;

      return acc;
    },
    {
      audioinput: {},
      audiooutput: {},
      videoinput: {},
    } as Record<MediaDeviceKind, Record<string, MediaDeviceInfo>>
  );
};

export default organizeMediaDevicesByKind;
