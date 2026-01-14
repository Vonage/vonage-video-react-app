import type { DeviceKind } from '@core/stores/devices/actions/getConnectedDeviceId';
import { Publisher } from '@vonage/client-sdk-video';
import { useCallback, useState } from 'react';
import getDeviceId from './helpers/getDeviceId';
import useStableRef from '@common/hooks/useStableRef';

type UpdateCallback = () => void;

type Media = [string | null, UpdateCallback];

/**
 * Return the publisher media id for the given kind ('audioinput' | 'videoinput')
 */
const usePublisherMediaDeviceId = (publisher: Publisher | null, kind: DeviceKind): Media => {
  const [trigger, setTrigger] = useState({});

  const refreshDeviceId = useCallback(() => setTrigger({}), []);

  const deviceId = useStableRef(
    () => getDeviceId(publisher, kind),
    [publisher, kind, trigger]
  ).current;

  return [deviceId, refreshDeviceId];
};

export default usePublisherMediaDeviceId;
