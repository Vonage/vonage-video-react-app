import { useState, useCallback } from 'react';
import type { Publisher } from '@vonage/client-sdk-video';
import mediaDevices$ from '@core/stores/devices';
import frontendLogger from '../logger';
import tryCatch from '@common/execution/tryCatch';

const UNMUTE_TIMEOUT_MS = 1000;

/**
 * Some cameras accept setVideoSource without throwing but produce black video:
 * the track starts muted and never delivers frames (e.g. face-mode incompatibility on mobile).
 * Wait up to UNMUTE_TIMEOUT_MS for the track to start delivering frames.
 */
const waitForUnmute = (track: MediaStreamTrack): Promise<boolean> =>
  new Promise((resolve) => {
    if (!track.muted) {
      resolve(true);
      return;
    }

    const timer = setTimeout(() => resolve(false), UNMUTE_TIMEOUT_MS);

    const cleanAndResolve = (ok: boolean) => {
      clearTimeout(timer);
      resolve(ok);
    };

    track.addEventListener('unmute', () => cleanAndResolve(true), { once: true });
    track.addEventListener('ended', () => cleanAndResolve(false), { once: true });
  });

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

      const { track } = publisher.getVideoSource();

      // Explicit hardware failure — track died during switch
      if (!track || track.readyState === 'ended') {
        setCameraError('devices.video.camera.hardware-error');
        return false;
      }

      // Silent black-screen failure — track live but not delivering frames
      if (!(await waitForUnmute(track))) {
        setCameraError('devices.video.camera.no-video');
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
