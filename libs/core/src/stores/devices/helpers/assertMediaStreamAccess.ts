type Args = {
  kind: MediaDeviceKind;
  deviceId: string;
};

const assertMediaStreamAccess = async ({ kind, deviceId }: Args): Promise<void> => {
  const constraints: MediaStreamConstraints = {
    audio: kind === 'audioinput' ? { deviceId: { exact: deviceId } } : false,
    video: kind === 'videoinput' ? { deviceId: { exact: deviceId } } : false,
  };

  const stream = await navigator.mediaDevices.getUserMedia(constraints).catch((error: Error) => {
    throw new Error(`Failed to access ${kind} device: ${deviceId}`, { cause: error });
  });

  stream.getTracks().forEach((track) => track.stop());
};

export default assertMediaStreamAccess;
