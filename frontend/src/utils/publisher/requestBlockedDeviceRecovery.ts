import requestDeviceAccess from './requestDeviceAccess';
import type { DeviceKind } from './deviceAccess';

/**
 * Click-to-re-prompt recovery for a blocked device, shared by every badge button (waiting room and
 * in-call): re-requests browser access with a one-off getUserMedia and, when granted, recovers the
 * device in place. The prompt only reappears while the permission is still pending (e.g. a
 * dismissed prompt); after an explicit block the browser stays silent and the blocked tooltip
 * guides the user to their settings. On Chrome the permission watcher recovers the device by
 * itself; Safari never fires it, so `reacquireDevice` is the fallback (a no-op on Chrome).
 */
const requestBlockedDeviceRecovery = ({
  device,
  reacquireDevice,
}: {
  device: DeviceKind;
  reacquireDevice: (device: DeviceKind) => void;
}): void => {
  void requestDeviceAccess({ device }).then((outcome) => {
    if (outcome === 'granted') {
      reacquireDevice(device);
    }
  });
};

export default requestBlockedDeviceRecovery;
