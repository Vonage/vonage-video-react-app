import { useCallback } from 'react';
import { isFrontFacingLabel, isRearFacingLabel } from '@utils/cameraSwitch';
import usePublisherContext from '../usePublisherContext';
import usePreferredCameras from '../usePreferredCameras';

export type UseCameraToggleResult = {
  canSwitch: boolean;
  handleToggle: () => void;
};

/**
 * Encapsulates front/rear camera switching for the local publisher.
 *
 * - `canSwitch` is true when the local camera is on and more than one video
 *   input device is available.
 * - `handleToggle` swaps to the opposite-facing camera (front <-> rear) when
 *   one can be identified, otherwise to any device other than the current one.
 */
const useCameraToggle = (): UseCameraToggleResult => {
  const { publisher, isVideoEnabled } = usePublisherContext();
  const videoInputDevices = usePreferredCameras();

  const canSwitch = isVideoEnabled && videoInputDevices.length > 1;

  const handleToggle = useCallback(() => {
    if (!publisher) return;
    const currentSource = publisher.getVideoSource?.();
    const currentDevice = videoInputDevices.find(
      (device) => device.deviceId === currentSource?.deviceId
    );
    const currentIsFront = isFrontFacingLabel(currentDevice?.label);

    const pickFront = () =>
      videoInputDevices.find((device) => isFrontFacingLabel(device.label)) ||
      videoInputDevices.find((device) => device.deviceId !== currentSource?.deviceId);

    const pickRear = () =>
      videoInputDevices.find((device) => isRearFacingLabel(device.label)) ||
      videoInputDevices.find(
        (device) => !isFrontFacingLabel(device.label) && device.deviceId !== currentSource?.deviceId
      );

    const target = currentIsFront ? pickRear() : pickFront();

    if (target?.deviceId && target.deviceId !== currentSource?.deviceId) {
      void publisher.setVideoSource(target.deviceId);
    }
  }, [publisher, videoInputDevices]);

  return { canSwitch, handleToggle };
};

export default useCameraToggle;
