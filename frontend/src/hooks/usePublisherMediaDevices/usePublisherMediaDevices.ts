import type { DeviceKind } from '@Context/Device/actions/getConnectedDeviceId';
import useAudioInputDevices from '@Context/Device/hooks/useAudioInputDevices';
import { getAudioSourceDeviceId } from '@utils/util';
import { Publisher } from '@vonage/client-sdk-video';
import { useEffect, useEffectEvent, useRef, useState } from 'react';

type Media = [string | null, React.Dispatch<React.SetStateAction<string | null>>];

/**
 * Return the publisher media id for the given kind ('audioinput' | 'videoinput')
 */
const usePublisherMediaDeviceId = (publisher: Publisher | null, kind: DeviceKind): Media => {
  const publisherRef = useRef<Publisher | null>(publisher);
  const didPublisherChange = publisherRef.current !== publisher;

  const [deviceId, setDeviceId] = useState(() => getDeviceId(publisher, kind));

  const tryToUpdateDeviceId = useEffectEvent(() => {
    if (!didPublisherChange) return;

    setDeviceId(getDeviceId(publisher, kind));
  });

  useEffect(() => {
    tryToUpdateDeviceId();
  }, [publisher]);

  publisherRef.current = publisher;

  return [deviceId, setDeviceId];
};

function getDeviceId(publisher: Publisher | null, kind: DeviceKind): string | null {
  if (!publisher) return null;

  if (kind === 'videoinput') {
    const source = publisher.getVideoSource();
    return source?.deviceId ?? null;
  }

  if (kind === 'audioinput') {
    // [TODO]: check why audio needs to lookup differently than video, legacy setMediaDevices, mediaDeviceUtils.ts
    const source = publisher.getAudioSource();
    return getAudioSourceDeviceId(useAudioInputDevices.getState(), source);
  }

  return null;
}

export default usePublisherMediaDeviceId;
