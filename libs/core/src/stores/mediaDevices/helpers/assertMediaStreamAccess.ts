import { assertResult } from '@common/execution';
import { makeApplicationErrorMapper, ErrorCode } from '@core/errors';
import { MediaDeviceInfoJSON } from '@web/types';

const assertMediaStreamAccess = async ({
  kind,
  deviceId,
  label,
}: MediaDeviceInfoJSON): Promise<void> => {
  const constraints: MediaStreamConstraints = {
    audio: kind === 'audioinput' ? { deviceId: { exact: deviceId } } : false,
    video: kind === 'videoinput' ? { deviceId: { exact: deviceId } } : false,
  };

  const stream = await assertResult(
    () => navigator.mediaDevices.getUserMedia(constraints),
    makeApplicationErrorMapper({
      fallbackMessage: `Failed to access ${kind} device: ${label}`,
      type: ErrorCode.DeviceAccess,
    })
  );

  assertResult(
    () => stream.getTracks().forEach((track) => track.stop()),
    makeApplicationErrorMapper({
      fallbackMessage: `Failed to access ${kind} track for device: ${label}`,
      type: ErrorCode.DevicesTrackUnavailable,
    })
  );
};

export default assertMediaStreamAccess;
