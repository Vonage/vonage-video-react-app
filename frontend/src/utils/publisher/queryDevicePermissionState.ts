import type { DeviceKind } from './deviceAccess';

/**
 * Reads a single device's browser permission state, or null when the Permissions API can't answer
 * (e.g. Firefox rejects 'camera'/'microphone'). Used to refine a waiting-room denial carried into the
 * call on join: a device the user allowed in the meantime reads 'granted' and is requested normally,
 * while a still-denied one (or an unknown 'null') keeps its badge without a fresh prompt.
 * @param {DeviceKind} device - the device whose permission to read.
 * @returns {Promise<PermissionState | null>} the permission state, or null if it can't be read.
 */
const queryDevicePermissionState = async (device: DeviceKind): Promise<PermissionState | null> => {
  try {
    const status = await window.navigator.permissions.query({ name: device as PermissionName });
    return status.state;
  } catch {
    return null;
  }
};

export default queryDevicePermissionState;
