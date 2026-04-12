import mediaDevices$ from '../devicesStore';

/**
 * Returns the selected device ID for the given media device kind.
 */
function useDeviceId(kind: MediaDeviceKind): string | undefined {
  return mediaDevices$.use.select((state) => state[kind], [kind]);
}

export default useDeviceId;
