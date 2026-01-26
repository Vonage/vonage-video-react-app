import devicesStore from '../devicesStore';
import type { NativeMediaDeviceInfo } from '../schemas';

const devicesMap$ = devicesStore.createObservable(
  ({ mediaDevices }) => {
    return mediaDevices.reduce(
      (acc, device) => {
        const devices = acc[device.kind] || {
          default: device,
        };

        devices[device.deviceId] = device;
        acc[device.kind] = devices;

        return acc;
      },
      {} as Record<MediaDeviceKind, Record<string, NativeMediaDeviceInfo>>
    );
  },
  {
    isEqualRoot: (prev, next) => prev.mediaDevices === next.mediaDevices,
  }
);

export default devicesMap$;
