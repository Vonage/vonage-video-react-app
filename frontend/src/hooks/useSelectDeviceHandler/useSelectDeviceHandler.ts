import { makeApplicationErrorMapper, ErrorCode } from '@core/errors';
import { mediaDevices$ } from '@core/stores';
import { handleClientApplicationError } from '@ui/helpers';
import { t } from 'i18next';
import { useCallback } from 'react';

/**
 * Handler for selecting a media device. Adds custom error handling for device selection errors, mapping them to user-friendly messages and logging them appropriately.
 */
const useSelectDeviceHandler = () => {
  const handleDeviceChange = useCallback(
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
        const applicationError = makeApplicationErrorMapper(
          'An error occurred while changing the device'
        )(error);

        if (applicationError.type === ErrorCode.DeviceAccess) {
          applicationError.fallbackMessage = t('devices.access.error');
        }

        handleClientApplicationError(applicationError);
      }
    },
    []
  );

  return { handleDeviceChange };
};

export default useSelectDeviceHandler;
