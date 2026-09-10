import isFirefox from '@web/platform/isFirefox';
import type { DevicesAPI } from '../../types';

/**
 * Firefox does not expose `MediaDeviceInfo.label`s until a media permission has been granted for
 * the origin. To populate the device-selection UI with real device names, this action briefly
 * requests camera + microphone access and then stops the tracks (the store is synced again via
 * the getUserMedia action).
 *
 * It must be called only when labelled devices are actually required (e.g. when entering the
 * Waiting Room), never at store init — otherwise Firefox lights the camera LED on the landing page.
 * See https://github.com/Vonage/vonage-video-react-app/issues/723.
 *
 * On non-Firefox browsers labels are already available without a permission grant, so this is a
 * no-op.
 */
function requestDeviceLabels(this: DevicesAPI['actions']) {
  return async (_api: DevicesAPI): Promise<void> => {
    if (!isFirefox()) return;

    const devices = await navigator.mediaDevices.enumerateDevices();

    const hasLabels = devices.some((device) => device.label);
    if (hasLabels) return;

    // Request permission so the browser reveals device labels, then release the devices again.
    const stream = await this.getUserMedia({ audio: true, video: true });
    stream.getTracks().forEach((track) => track.stop());
  };
}

export default requestDeviceLabels;
