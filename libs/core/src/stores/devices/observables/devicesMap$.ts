import devicesStore from '../devicesStore';
import type { VonageDeviceId } from '../schemas';

const devicesMap$ = devicesStore.createObservable(
  ({ mediaDevices }) => {
    return mediaDevices.reduce(
      (acc, device) => {
        const devices = acc[device.kind] || {
          default: device,
        };

        devices[device.deviceId as VonageDeviceId] = device;
        acc[device.kind] = devices;

        return acc;
      },
      {} as Record<MediaDeviceKind, Record<VonageDeviceId | 'default', MediaDeviceInfo>>
    );
  },
  {
    isEqualRoot: (prev, next) => prev.mediaDevices === next.mediaDevices,
  }
);

export default devicesMap$;
