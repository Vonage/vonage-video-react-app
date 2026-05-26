import type { Publisher } from '@vonage/client-sdk-video';
import mediaDevices$ from '@core/stores/devices';
import { isMobile } from '@web/platform';
import { ErrorCode, makeApplicationErrorMapper } from '@core/errors';
import { frontFacingKeywords, rearFacingKeywords } from '@core/stores/devices/constants';
import { FacingMode } from '@common/types';

/**
 * Gets the facing mode of the publisher's video track.
 *
 * [TODO]: After migrating publisher context, this should became an action of publisher$
 */
const getFacingMode = ({ publisher }: { publisher: Publisher }): FacingMode => {
  if (!isMobile()) {
    throw makeApplicationErrorMapper({
      fallbackMessage: 'Camera facing mode is only supported on mobile devices.',
      type: ErrorCode.FacingModeNotSupported,
    })(null);
  }

  const { track, deviceId } = publisher.getVideoSource?.() ?? {};

  if (!track || !deviceId) {
    return FacingMode.unknown;
  }

  const { facingMode } = track.getSettings();

  if (facingMode === FacingMode.user || facingMode === FacingMode.environment) {
    return FacingMode[facingMode];
  }

  /**
   * If facingMode is not available from the track settings, we try to infer it from the device label.
   */
  const { videoinput } = mediaDevices$.mediaDevicesMap$.getState();
  const videoInputLabel = videoinput?.[deviceId]?.label?.toLowerCase();

  if (!videoInputLabel) {
    return FacingMode.unknown;
  }

  if (rearFacingKeywords.some((keyword) => videoInputLabel.includes(keyword))) {
    return FacingMode.environment;
  }

  if (frontFacingKeywords.some((keyword) => videoInputLabel.includes(keyword))) {
    return FacingMode.user;
  }

  return FacingMode.unknown;
};

export default getFacingMode;
