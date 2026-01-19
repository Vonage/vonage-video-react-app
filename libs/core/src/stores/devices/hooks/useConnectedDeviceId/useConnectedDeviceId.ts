import useSuspenseMemo from '@common/hooks/useSuspenseMemo';
import devices$ from '../../DevicesStore';
import type { DeviceKind } from '../../types';
import getConnectedDeviceIds from './helpers/getConnectedDeviceIds';

/**
 * Returns the id of the connected device for the given kind ('audioinput' | 'videoinput')
 * The Id retrieval is asynchronous and will suspend the component until the id is available.
 */
function useConnectedDeviceId(kind: DeviceKind): string | null;

/**
 * Returns the ids of the connected devices for the given kinds ('audioinput' | 'videoinput')
 * The Ids retrieval is asynchronous and will suspend the component until the ids are available.
 */
function useConnectedDeviceId(...kinds: [DeviceKind, ...DeviceKind[]]): (string | null)[];

function useConnectedDeviceId(...kinds: DeviceKind[]): string | null | (string | null)[] {
  const mediaDevices = devices$.use.select((state) => state.mediaDevices);

  return useSuspenseMemo(() => {
    const meta = devices$.getMetadata();

    // suspend until media devices are loaded and ids are available
    if (meta.loadingMediaDevices?.status === 'pending') {
      return meta.loadingMediaDevices.then((mediaDevices) => {
        return getConnectedDeviceIds(mediaDevices, kinds);
      });
    }

    return getConnectedDeviceIds(mediaDevices, kinds);
  }, [mediaDevices, ...kinds]);
}

export default useConnectedDeviceId;
