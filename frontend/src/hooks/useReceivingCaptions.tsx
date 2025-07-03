import { Subscriber } from '@vonage/client-sdk-video';
import { useState, useEffect, useMemo } from 'react';

/**
 *   @typedef CaptionsType
 *   @property {string} caption - The current caption text.
 *   @property {boolean} isReceivingCaptions - Indicates whether captions are currently being received
 */
export type CaptionsType = {
  caption: string;
  isReceivingCaptions: boolean;
};

/**
 *  @typedef ReceivingCaptionsProps
 *  @property {Subscriber | null} subscriber - The subscriber object from which to receive captions
 */
export type ReceivingCaptionsProps = {
  subscriber?: Subscriber | null;
};

/**
 * @typedef CaptionReceivedType
 * @property {string} streamId - The ID of the stream from which the caption was received.
 * @property {string} caption - The text of the caption received.
 * @property {boolean} isFinal - Indicates whether the caption is final or still being processed
 */
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
