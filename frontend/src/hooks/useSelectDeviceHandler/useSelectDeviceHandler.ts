import { makeApplicationErrorMapper, ErrorCode } from '@core/errors';
import { mediaDevices$ } from '@core/stores';
import { t } from 'i18next';
import { useCallback } from 'react';

/**
 * Handler for selecting a media device. Adds custom error handling for device selection errors, mapping them to user-friendly messages and logging them appropriately.
 */
const useSelectDeviceHandler = () => {
  const handleSelectDevice = useCallback(
    async ({
      deviceId,
      mediaDeviceKind,
    }: {
      deviceId: string;
      mediaDeviceKind: MediaDeviceKind;
    }) => {
      try {
        await mediaDevices$.actions.selectDevice(mediaDeviceKind, deviceId);
      } catch (error) {
        const targetDeviceLabel =
          {
            audioinput: t('devices.audio.microphone.full'),
            videoinput: t('devices.video.camera.full'),
            audiooutput: t('devices.audio.speakers.full'),
          }[mediaDeviceKind] ?? t('devices.select.unknownDevice');

        const fallbackMessage = t('devices.select.errorContext', { device: targetDeviceLabel });

        const applicationError = makeApplicationErrorMapper(fallbackMessage)(error);

        if (applicationError.type === ErrorCode.DeviceAccess) {
          applicationError.fallbackMessage = t('devices.select.accessDenied', {
            device: targetDeviceLabel,
          });
        }

        if (applicationError.type === ErrorCode.DevicesTrackUnavailable) {
          applicationError.fallbackMessage = t('devices.select.trackUnavailable', {
            device: targetDeviceLabel,
          });
        }

        throw applicationError;
      }
    },
    []
  );

  return { handleSelectDevice };
};

export default useSelectDeviceHandler;
