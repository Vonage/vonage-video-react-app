import mediaDevices$ from '../devicesStore';
import type { DevicesStoreState } from '../types';

/**
 * Returns the selected device ID for the given media device kind.
 */
function useDeviceId(kind: MediaDeviceKind): string | undefined {
  return mediaDevices$.use.select((state: DevicesStoreState) => state[kind], [kind]);
}

export default useDeviceId;
