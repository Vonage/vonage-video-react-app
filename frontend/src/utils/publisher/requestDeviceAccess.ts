import type { DeviceKind } from './deviceAccess';

/**
 * Outcome of attempting to (re-)acquire a device permission via getUserMedia.
 * - `granted`     the user allowed access (or it was already allowed); the existing permission
 *                 `onchange` watchers take over and recover the publisher in place.
 * - `blocked`     the browser refused without a usable prompt — an explicit block leaves the
 *                 permission in the 'denied' state, so no prompt appears and the user must
 *                 re-allow the device from their browser settings.
 * - `unavailable` the request could not be satisfied for another reason (e.g. no such device,
 *                 or the Media Devices API is missing).
 */
export type DeviceAccessRequestOutcome = 'granted' | 'blocked' | 'unavailable';

/**
 * Attempts to surface a fresh browser permission prompt for a single blocked device by issuing a
 * one-off getUserMedia. A prompt only appears while the permission is still in the 'prompt' state
 * (for example the user dismissed an earlier prompt); after an explicit block the browser answers
 * with a NotAllowedError and shows no prompt, so the caller should then point the user at their
 * browser settings.
 *
 * Any track acquired here is stopped immediately — this only pokes the permission. Recovering the
 * real publisher is left to the existing permission `onchange` watchers (waiting room and in-call),
 * which re-initialize in place once the state flips to 'granted'.
 * @param {{ device: DeviceKind }} args - the blocked device to request access for.
 * @returns {Promise<DeviceAccessRequestOutcome>} the resolved outcome of the attempt.
 */
const requestDeviceAccess = async ({
  device,
}: {
  device: DeviceKind;
}): Promise<DeviceAccessRequestOutcome> => {
  const constraints: MediaStreamConstraints =
    device === 'microphone' ? { audio: true } : { video: true };

  try {
    const stream = await window.navigator.mediaDevices.getUserMedia(constraints);
    stream.getTracks().forEach((track) => track.stop());
    return 'granted';
  } catch (error) {
    const isExplicitlyBlocked = error instanceof DOMException && error.name === 'NotAllowedError';
    return isExplicitlyBlocked ? 'blocked' : 'unavailable';
  }
};

export default requestDeviceAccess;
