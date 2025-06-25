import { Subscriber } from '@vonage/client-sdk-video';
import { useState, useEffect, useMemo } from 'react';

// caption property is the text of the caption
// and the isReceivingCaptions property indicates whether the captions are currently being received.
export type CaptionsType = {
  caption: string;
  isReceivingCaptions: boolean;
};

export type ReceivingCaptionsProps = {
  subscriber?: Subscriber | null;
};

// These properties come from the captionReceived event emitted by the Vonage Video API.
// The streamId is the ID of the stream that the caption belongs to, caption is the text of the caption,
// and isFinal indicates whether this is the final caption for the stream.
// Link to the documentation: https://vonage.github.io/video-docs/video-js-reference/latest/CaptionReceivedEvent.html
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
