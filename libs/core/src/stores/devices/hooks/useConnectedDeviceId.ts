import useSuspenseMemo from '@common/hooks/useSuspenseMemo';
import devices$ from '../DevicesContext';
import type { DeviceKind } from '../actions/getConnectedDeviceId';

/**
 * Returns the id of the connected device for the given kind ('audioinput' | 'videoinput')
 * The Id retrieval is asynchronous and will suspend the component until the id is available.
 */
function useConnectedDeviceId(kind: DeviceKind): string | null;

/**
 * Returns the ids of the connected devices for the given kinds ('audioinput' | 'videoinput')
 * The Ids retrieval is asynchronous and will suspend the component until the ids are available.
 */
function useConnectedDeviceId(...kinds: DeviceKind[]): (string | null)[];

function useConnectedDeviceId(...kinds: DeviceKind[]): string | null | (string | null)[] {
  return useSuspenseMemo(async () => {
    const results = await Promise.all(
      kinds.map((kind) => devices$.actions.getConnectedDeviceId(kind))
    );

    return kinds.length === 1 ? results[0] : results;
  }, kinds);
}

export default useConnectedDeviceId;
