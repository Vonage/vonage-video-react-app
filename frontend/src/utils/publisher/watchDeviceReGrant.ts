import type { DeviceKind } from './deviceAccess';

/**
 * Watches a single device's browser permission and invokes `onReGrant` once the user
 * re-grants access. Used in-call (Google Meet style) to recover a blocked camera/microphone
 * in place — re-initializing the publisher without a page reload or leaving the call.
 *
 * No-ops in browsers whose Permissions API rejects 'camera'/'microphone' (e.g. Firefox);
 * there recovery falls back to the user retrying manually.
 */
const watchDeviceReGrant = async ({
  device,
  onReGrant,
}: {
  device: DeviceKind;
  onReGrant: (device: DeviceKind) => void;
}): Promise<void> => {
  try {
    const permissionStatus = await window.navigator.permissions.query({
      name: device as PermissionName,
    });
    permissionStatus.onchange = () => {
      if (permissionStatus.state === 'granted') {
        onReGrant(device);
      }
    };
  } catch {
    // Firefox rejects 'camera'/'microphone' as PermissionName — recovery is user-driven there.
  }
};

export default watchDeviceReGrant;
