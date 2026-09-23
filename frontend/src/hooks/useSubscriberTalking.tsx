import { Subscriber } from '@vonage/client-sdk-video';
import { useState, useEffect, useMemo, Dispatch, SetStateAction } from 'react';

const speakingTimeThreshold = 100;
const notSpeakingTimeThreshold = 800;
const speakingVolume = 0.1;

export type SubscriberTalkingProps = {
  subscriber: Subscriber;
  isActiveSpeaker: boolean;
};

const createOnHandleAudioLevelUpdated = (setIsTalking: Dispatch<SetStateAction<boolean>>) => {
  let isTalking = false;
  let timestamp = Date.now();

  const handleAudioLevel = (audioLevel: number) => {
    const now = Date.now();
    if (audioLevel > speakingVolume) {
      if (!isTalking) {
        isTalking = true;
        timestamp = now;
      } else if (now - timestamp > speakingTimeThreshold) {
        isTalking = true;
        timestamp = now;
        setIsTalking(true);
      }
    } else if (isTalking && now - timestamp > notSpeakingTimeThreshold) {
      isTalking = false;
      setIsTalking(false);
    }
  };

  return ({ audioLevel }: { audioLevel: number }) => handleAudioLevel(audioLevel);
};

/**
 * Hook to determine whether or not the subscriber is talking.
 * @param {SubscriberTalkingProps} props - The props for the hook.
 * @returns {boolean} Whether the Subscriber is talking or not.
 */
const useSubscriberTalking = ({ subscriber, isActiveSpeaker }: SubscriberTalkingProps): boolean => {
  const [isTalking, setIsTalking] = useState<boolean>(false);
  const audioLevelUpdateHandler = useMemo(
    () => createOnHandleAudioLevelUpdated(setIsTalking),
    [setIsTalking]
  );

  useEffect(() => {
    if (subscriber && isActiveSpeaker) {
      subscriber.on('audioLevelUpdated', audioLevelUpdateHandler);
    }

    return () => {
      if (subscriber) {
        subscriber.off('audioLevelUpdated', audioLevelUpdateHandler);
      }
      // Reset unconditionally on teardown. Depending on isTalking here would re-run this effect
      // on every talking toggle, churning the audioLevelUpdated listener (off/on) per subscriber.
      setIsTalking(false);
    };
  }, [subscriber, audioLevelUpdateHandler, isActiveSpeaker]);

  return isTalking;
};

export default useSubscriberTalking;
