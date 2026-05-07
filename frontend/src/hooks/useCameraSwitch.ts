import { useState, useCallback } from 'react';
import type { Publisher } from '@vonage/client-sdk-video';
import mediaDevices$ from '@core/stores/devices';
import frontendLogger from '../logger';
import tryCatch from '@common/execution/tryCatch';

const useCameraSwitch = (publisher: Publisher | null) => {
  const [cameraError, setCameraError] = useState<string | null>(null);

  const switchCamera = useCallback(
    async (deviceId: string): Promise<boolean> => {
      if (!publisher || !deviceId) return false;

      const { error } = await tryCatch(() => publisher.setVideoSource(deviceId));

      if (error) {
        frontendLogger.reportError(error, { source: 'useCameraSwitch: setVideoSource' });
        setCameraError('devices.video.camera.unavailable');
        return false;
      }

      setCameraError(null);
      await mediaDevices$.actions.selectDevice('videoinput', deviceId);
      return true;
    },
    [publisher]
  );

  const dismissCameraError = useCallback(() => setCameraError(null), []);

  return { switchCamera, cameraError, dismissCameraError };
};

export default useCameraSwitch;
