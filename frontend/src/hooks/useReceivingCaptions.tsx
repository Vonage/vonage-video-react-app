import { Subscriber } from '@vonage/client-sdk-video';
import { useState, useEffect, useMemo } from 'react';

export type CaptionsType = {
  caption: string;
  isReceivingCaptions: boolean;
};

export type ReceivingCaptionsProps = {
  subscriber?: Subscriber | null;
};

export type CaptionReceivedType = {
  streamId: string;
  caption: string;
  isFinal: boolean;
};

/**
 * Hook to manage receiving captions from a speaker.
 * @param {ReceivingCaptionsProps} props - The props for the hook.
 *  @property {Subscriber | null} subscriber - The subscriber object from which to receive captions.
 * @returns {CaptionsType} - The current caption text and whether captions are being received.
 */
const useReceivingCaptions = ({ subscriber }: ReceivingCaptionsProps): CaptionsType => {
  const [caption, setCaption] = useState<string>('');
  const [isReceivingCaptions, setIsReceivingCaptions] = useState<boolean>(false);

  const captionUpdateHandler = useMemo(
    () => (event: CaptionReceivedType) => {
      setIsReceivingCaptions(!!event.caption);
      setCaption(event.caption);
    },
    []
  );

  useEffect(() => {
    subscriber?.on('captionReceived', captionUpdateHandler);

    return () => {
      subscriber?.off('captionReceived', captionUpdateHandler);
    };
  }, [subscriber, captionUpdateHandler]);

  return { caption, isReceivingCaptions };
};

export default useReceivingCaptions;
