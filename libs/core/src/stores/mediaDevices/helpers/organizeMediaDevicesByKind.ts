import type { MediaDeviceInfoJSON } from '@web/types';

type Result = Record<MediaDeviceKind, Record<string, MediaDeviceInfoJSON>>;

const organizeMediaDevicesByKind = ({
  mediaDeviceInfo,
}: {
  mediaDeviceInfo: MediaDeviceInfoJSON[];
}): Result => {
  return mediaDeviceInfo.reduce(
    (acc, device) => {
      const devices = acc[device.kind];

      devices[device.deviceId] = device;
      acc[device.kind] = devices;

      return acc;
    },
    {
      audioinput: {},
      audiooutput: {},
      videoinput: {},
    } as Result
  );
};

export default organizeMediaDevicesByKind;
