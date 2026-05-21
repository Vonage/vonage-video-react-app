import { assertResult } from '@common/execution';
import { makeApplicationErrorMapper, ErrorCode } from '@core/errors';

type Args = {
  kind: MediaDeviceKind;
  deviceId: string;
};

const assertMediaStreamAccess = async ({ kind, deviceId }: Args): Promise<void> => {
  const constraints: MediaStreamConstraints = {
    audio: kind === 'audioinput' ? { deviceId: { exact: deviceId } } : false,
    video: kind === 'videoinput' ? { deviceId: { exact: deviceId } } : false,
  };

  const stream = await assertResult(
    () => navigator.mediaDevices.getUserMedia(constraints),
    makeApplicationErrorMapper({
      fallbackMessage: `Failed to access ${kind} device: ${deviceId}`,
      type: ErrorCode.DeviceAccess,
    })
  );

  assertResult(
    () => stream.getTracks().forEach((track) => track.stop()),
    makeApplicationErrorMapper({
      fallbackMessage: `Failed to access ${kind} track for device: ${deviceId}`,
      type: ErrorCode.DevicesTrackUnavailable,
    })
  );
};

export default assertMediaStreamAccess;
