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
 * Delay before the click-to-re-prompt fallback recovers a re-granted device in place.
 *
 * Automatic recovery is normally driven by `PermissionStatus.onchange`, but that event never fires
 * for camera/microphone in Safari (and is unreliable in Firefox). So when the user clicks a blocked
 * device and the one-off getUserMedia succeeds, we recover manually after this short grace period —
 * long enough for Chrome's `onchange` to have already recovered (in which case the fallback sees the
 * device is no longer denied and does nothing), avoiding a double rebuild.
 */
export const DEVICE_REACQUIRE_FALLBACK_MS = 250;

/**
 * True when at least one device is currently denied.
 */
export const hasDeniedDevice = (denied: DeniedDevices): boolean =>
  denied.microphone || denied.camera;
