import { attempt, tryCatch } from '@common/execution';
import { FacingMode } from '@common/types';
import { makeApplicationErrorMapper } from '@core/errors';
import { mediaDevices$ } from '@core/stores';
import useSelectDeviceHandler from '@hooks/useSelectDeviceHandler';
import { handleClientApplicationError } from '@ui/helpers';
import { useStableCallback } from '@web/hooks';
import { t } from 'i18next';

/**
 * Safely switch camera facing mode by attempting to get a new media stream with the desired facing mode constraint
 */
const useSwitchCameraFacingModeHandler = () => {
  const { handleSelectDevice } = useSelectDeviceHandler();

  const switchCameraFacingModeHandler = useStableCallback(async () => {
    const { videoinput: currentDeviceId } = mediaDevices$.getState();
    const { videoinput: videoinputDevices } = mediaDevices$.mediaDevicesMap$.getState();

    const { inferredFacingMode: currentFacingMode } = videoinputDevices[currentDeviceId!] || {};

    const targetFacingMode =
      currentFacingMode === FacingMode.user ? FacingMode.environment : FacingMode.user;

    try {
      let { result: mediaStream, error } = await tryCatch(() =>
        navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              exact: targetFacingMode,
            },
          },
        })
      );

      let targetDeviceLabel: string = 'unknown';

      if (!mediaStream) {
        const videoInputDevices = Object.values(videoinputDevices);

        // try to get a stream by device id as fallback
        const targetDevice = videoInputDevices.find(
          ({ inferredFacingMode, deviceId }) =>
            inferredFacingMode === targetFacingMode && deviceId !== currentDeviceId
        );

        if (!targetDevice) {
          throw makeApplicationErrorMapper(
            t('devices.video.camera.noDeviceError', {
              facingMode: targetFacingMode,
            })
          )(null);
        }

        targetDeviceLabel = targetDevice.label;

        ({ result: mediaStream, error } = await tryCatch(() =>
          navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: targetDevice.deviceId,
            },
          })
        ));
      }

      if (error || !mediaStream) {
        const applicationError = makeApplicationErrorMapper(
          t('devices.video.camera.accessError', {
            facingMode: targetFacingMode,
          })
        )(error);

        if (targetDeviceLabel) {
          applicationError.add(
            t('devices.video.camera.selectedDevice', {
              deviceName: targetDeviceLabel,
            })
          );
        }

        throw applicationError;
      }

      const [track] = mediaStream.getVideoTracks();
      const deviceId = track?.getSettings().deviceId;

      attempt(() => mediaStream?.getTracks().forEach((track) => track.stop()));

      if (!deviceId) {
        throw makeApplicationErrorMapper(
          t('devices.video.camera.noTrackError', {
            facingMode: targetFacingMode,
          })
        )(null);
      }

      await handleSelectDevice({ mediaDeviceKind: 'videoinput', deviceId });
    } catch (error) {
      const facingModeLabel =
        targetFacingMode === FacingMode.user
          ? t('devices.video.camera.front')
          : t('devices.video.camera.rear');

      const fallbackMessage = t('devices.video.camera.switchError', {
        facingMode: facingModeLabel,
      });

      handleClientApplicationError(fallbackMessage, error);
    }
  });

  return {
    /**
     * Handler to switch camera facing mode.
     */
    switchCameraFacingModeHandler,
  };
};

export default useSwitchCameraFacingModeHandler;
