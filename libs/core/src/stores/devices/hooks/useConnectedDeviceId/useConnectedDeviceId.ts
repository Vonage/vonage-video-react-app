/* eslint-disable @typescript-eslint/no-unsafe-return */
import useSuspenseMemo from '@common/hooks/useSuspenseMemo';
import devicesStore from '../../devicesStore';
import type { VonageDeviceId } from '../../schemas';
import devicesMap$ from '../../observables/devicesMap$';

/**
 * Returns the id of the connected device for the given kind ('audioinput' | 'videoinput')
 * The Id retrieval is asynchronous and will suspend the component until the id is available.
 */
function useConnectedDeviceId(kind: MediaDeviceKind): MediaDeviceInfo | null;

/**
 * Returns the ids of the connected devices for the given kinds ('audioinput' | 'videoinput')
 * The Ids retrieval is asynchronous and will suspend the component until the ids are available.
 */
function useConnectedDeviceId(
  ...kinds: [MediaDeviceKind, MediaDeviceKind]
): (MediaDeviceInfo | null)[];

function useConnectedDeviceId(
  ...kinds: MediaDeviceKind[]
): MediaDeviceInfo | null | (MediaDeviceInfo | null)[] {
  const mediaDevices = devicesStore.use.select((state) => state.mediaDevices);

  const results = useSuspenseMemo(() => {
    const meta = devicesStore.getMetadata();

    const getDevices = () => {
      const devicesMap = devicesMap$.getState();

      console.log('devicesMap in useConnectedDeviceId:', devicesMap);

      // selected devices synchronized with local store
      const { selectedDevices } = devicesStore.getState();

      const devices = kinds.map((kind) => {
        const device = selectedDevices.get(kind);
        if (!device) return devicesMap[kind]?.['default'] ?? null;

        const perKind = devicesMap[kind];
        if (Object.keys(perKind || {}).length === 0) return null;

        return perKind[device.deviceId as VonageDeviceId] ?? null;
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

export default useConnectedDeviceId;
