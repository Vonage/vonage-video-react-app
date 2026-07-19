/**
 * Shared model for tracking which capture devices the browser has blocked.
 * Used by both the waiting-room preview publisher and the in-call publisher so the
 * UI can badge the specific denied device (Google Meet style) rather than showing a
 * generic "camera and/or microphone" message.
 */
export type DeviceKind = 'microphone' | 'camera';

export type DeniedDevices = {
  microphone: boolean;
  camera: boolean;
};

export const NO_DENIED_DEVICES: DeniedDevices = { microphone: false, camera: false };

/**
 * True when at least one device is currently denied.
 */
export const hasDeniedDevice = (denied: DeniedDevices): boolean =>
  denied.microphone || denied.camera;
