import useSuspenseMemo from '@common/hooks/useSuspenseMemo';
import devicesStore from '../../devicesStore';
import type { VonageDeviceId, NativeMediaDeviceInfo } from '../../schemas';
import devicesMap$ from '../../observables/devicesMap$';
import { useAssertSuspense } from '@common/hooks';

type DeviceType = 'audioinput' | 'videoinput';

/**
 * Returns the connected device for the given kind ('audioinput' | 'videoinput').
 * Returns the selected device if one is set, otherwise returns the default device for that kind.
 * The device retrieval is asynchronous and will suspend the component until the device is available.
 */
function useDevices(kind: DeviceType): NativeMediaDeviceInfo | null;

/**
 * Returns the connected devices for the given kinds ('audioinput' | 'videoinput').
 * Returns the selected device for each kind if set, otherwise returns the default device for that kind.
 * The device retrieval is asynchronous and will suspend the component until the devices are available.
 */
function useDevices(
  ...kinds: ['audioinput', 'videoinput'] | ['videoinput', 'audioinput']
): (NativeMediaDeviceInfo | null)[];

function useDevices(
  ...kinds: DeviceType[]
): NativeMediaDeviceInfo | null | (NativeMediaDeviceInfo | null)[] {
  useAssertSuspense('useDevices must be used within a SuspenseBoundary Provider');

  const mediaDevices = devicesStore.use.select((state) => state.mediaDevices);

  const results = useSuspenseMemo(() => {
    const meta = devicesStore.getMetadata();

    const getDevices = () => {
      const devicesMap = devicesMap$.getState();

      console.log('devicesMap in useDevices:', devicesMap);

      // Get selected devices from state
      const { selectedAudioInput, selectedVideoInput } = devicesStore.getState();

      const devices = kinds.map((kind) => {
        const selectedDevice = kind === 'audioinput' ? selectedAudioInput : selectedVideoInput;
        if (!selectedDevice) return devicesMap[kind]?.['default'] ?? null;

        const perKind = devicesMap[kind];
        if (Object.keys(perKind || {}).length === 0) return null;

        return perKind[selectedDevice.deviceId as VonageDeviceId] ?? null;
      });

      return kinds.length === 1 ? devices[0] : devices;
    };

    // suspend until media devices are loaded and ids are available
    if (meta.loadingMediaDevices?.status === 'pending') {
      return meta.loadingMediaDevices.then(getDevices);
    }

    return getDevices();
  }, [mediaDevices, ...kinds]);

  return results;
}

export default useDevices;
