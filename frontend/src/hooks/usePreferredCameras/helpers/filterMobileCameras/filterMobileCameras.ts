import type { MediaDeviceInfoJSON } from '@web/types';
import { isMobile } from '@web/platform';
import { isFrontFacingLabel, isRearFacingLabel } from '@utils/cameraSwitch';

/**
 * Filters video input devices on mobile to only show one primary front-facing
 * and one primary rear-facing camera. This prevents issues with devices that
 * enumerate multiple physical cameras where only one front and one rear camera
 * actually function correctly.
 *
 * On non-mobile devices, returns all devices unchanged.
 *
 * @param {Device[]} videoInputDevices - Array of video input devices to filter
 * @returns {Device[]} - Filtered array containing at most one front and one rear camera on mobile, or all devices on desktop
 */
function filterMobileCameras(videoInputDevices: MediaDeviceInfoJSON[]): MediaDeviceInfoJSON[] {
  if (!isMobile()) return videoInputDevices;

  const front = videoInputDevices.find((d) => isFrontFacingLabel(d.label));
  const rear = videoInputDevices.find((d) => isRearFacingLabel(d.label));
  const unknown = videoInputDevices.filter(
    (d) => !isFrontFacingLabel(d.label) && !isRearFacingLabel(d.label)
  );

  return [front, rear, ...unknown].filter((d): d is MediaDeviceInfoJSON => d !== undefined);
}

export default filterMobileCameras;
