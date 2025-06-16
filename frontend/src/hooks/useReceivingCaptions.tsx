import { Subscriber } from '@vonage/client-sdk-video';
import { useState, useEffect, useMemo } from 'react';

export type CaptionsType = {
  captionText: string;
  isReceivingCaptions: boolean;
};

export type ReceivingCaptionsProps = {
  subscriber?: Subscriber | null;
};

/**
 * Hook to manage receiving captions from a subscriber.
 * @param {ReceivingCaptionsProps} props - The props for the hook.
 * @returns {CaptionsType} - The current caption text and whether captions are being received.
 */
const useReceivingCaptions = ({ subscriber }: ReceivingCaptionsProps): CaptionsType => {
  const [captionText, setCaptionText] = useState<string>('');
  const [isReceivingCaptions, setIsReceivingCaptions] = useState<boolean>(false);

  const captionUpdateHandler = useMemo(
    () => (event: { streamId: string; caption: string; isFinal: boolean }) => {
      setIsReceivingCaptions(!!event.caption);
      setCaptionText(event.caption);
    },
    []
  );

  useEffect(() => {
    subscriber?.on('captionReceived', captionUpdateHandler);

    return () => {
      subscriber?.off('captionReceived', captionUpdateHandler);
    };
  }, [subscriber, captionUpdateHandler]);

  return { captionText, isReceivingCaptions };
};

export default useReceivingCaptions;
