import type { DeviceKind } from './deviceAccess';

/**
 * Watches a single device's browser permission and invokes `onReGrant` once the user
 * re-grants access. Used in-call (Google Meet style) to recover a blocked camera/microphone
 * in place — re-initializing the publisher without a page reload or leaving the call.
 *
 * No-ops in browsers whose Permissions API rejects 'camera'/'microphone' (e.g. Firefox);
 * there recovery falls back to the user retrying manually.
 * @returns a detach function that removes the `change` listener, or undefined when unsupported. The
 *   caller MUST call it once the device recovers (and on unmount) — `permissions.query` hands back a
 *   fresh PermissionStatus each call, so an undetached listener from a prior denial stays live and a
 *   later re-denial would stack a second watcher.
 */
const watchDeviceReGrant = async ({
  device,
  onReGrant,
}: {
  device: DeviceKind;
  onReGrant: (device: DeviceKind) => void;
}): Promise<(() => void) | undefined> => {
  try {
    const permissionStatus = await window.navigator.permissions.query({
      name: device as PermissionName,
    });
    const handleChange = () => {
      if (permissionStatus.state === 'granted') {
        onReGrant(device);
      }
    };
    permissionStatus.addEventListener('change', handleChange);
    return () => permissionStatus.removeEventListener('change', handleChange);
  } catch {
    // Firefox rejects 'camera'/'microphone' as PermissionName — recovery is user-driven there.
    return undefined;
  }
};

export default watchDeviceReGrant;
