import { useCallback, useMemo, useState } from 'react';
import { Connection } from '@vonage/client-sdk-video';
import { throttle } from 'lodash';
import { EMOJI_DISPLAY_DURATION } from '../utils/constants';
import { SignalEvent, SignalType, SubscriberWrapper } from '../types/session';

type EmojiDataType = {
  emoji: string;
  time: number;
};

export type UseEmojiProps = {
  signal: ((data: SignalType) => void) | undefined;
  connectionId: string | undefined;
};

export type UseEmoji = {
  sendEmoji: (emoji: string) => void;
  emojiQueue: EmojiWrapper[];
  onEmoji: (event: SignalEvent, subscriberWrappers: SubscriberWrapper[]) => void;
};

export type EmojiWrapper = {
  name: string;
  emoji: string;
  time: number;
};

/**
 * React hook to queue emojis into an array for display and provides functions for sending and receiving emojis.
 * @param {UseEmojiProps}  props - props for the hook
 *  @property {((data: SignalType) => void) | undefined} signal - function to send signal to all participants
 *  @property {string | undefined} connectionId - the connection ID of the current user
 * @returns {UseEmoji} returned object
 *  @property {(emoji: string) => void} sendEmoji - function to send emojis
 *  @property {EmojiWrapper[]} emojiQueue - emojis to display
 *  @property {(event: SignalEvent, subscriberWrappers: SubscriberWrapper[]) => void} onEmoji - emoji handler
 */
const useEmoji = ({ signal, connectionId }: UseEmojiProps): UseEmoji => {
  const [emojiQueue, setEmojiQueue] = useState<EmojiWrapper[]>([]);

  /**
   * Sends an emoji to all participants in the room.
   * @param {string} emoji - The emoji to be sent
   */
  const sendEmoji = useMemo(() => {
    // We limit emojis to being sent every 500ms.
    const throttledFunc = throttle(
      (emoji: string) => {
        const data = JSON.stringify({ emoji, time: new Date().getTime() });
        if (!signal) {
          return;
        }
        signal({ type: 'emoji', data });
      },
      500,
      { leading: true, trailing: false }
    );
    return throttledFunc;
  }, [signal]);

  /**
   * Checks if the given connection belongs to the current user.
   * @param {Connection} sendingConnection - The connection of a user.
   * @returns {boolean} - Returns `true` if the connection is the current user's, else `false`.
   */
  const isOwnConnection = useCallback(
    (sendingConnection: Connection): boolean => {
      const yourConnectionId = connectionId;

      return sendingConnection.connectionId === yourConnectionId;
    },
    [connectionId]
  );

  /**
   * Retrieves the user's name or `You` if you are the sender from a given Connection.
   * @param {Connection} sendingConnection - The connection object to evaluate.
   * @param {SubscriberWrapper[]} subscriberWrappers - all subscriber wrappers in the session
   * @returns {string} The user's name, `You`, or an empty string.
   */
  const getSenderName = useCallback(
    (
      sendingConnection: Connection,
      subscriberWrappers: SubscriberWrapper[]
    ): string | undefined => {
      const isYou = isOwnConnection(sendingConnection);
      if (isYou) {
        return 'You';
      }

      const sendingSubscriberWrapper = subscriberWrappers.find(
        (subscriberWrapper) =>
          subscriberWrapper.subscriber.stream?.connection.connectionId ===
            sendingConnection?.connectionId && !subscriberWrapper.isScreenshare
      );
      return sendingSubscriberWrapper?.subscriber.stream?.name;
    },
    [isOwnConnection]
  );

  /**
   * Manages signals sent by users in the room. Any emojis sent by the room's users
   * are processed in a data queue to be rendered in the application.
   * @param {SignalEvent} signalEvent - Signal event dispatched by the session.
   * @param {SubscriberWrapper[]} subscriberWrappers - all subscriber wrappers in the session
   */
  const onEmoji = useCallback(
    ({ data, from: sendingConnection }: SignalEvent, subscriberWrappers: SubscriberWrapper[]) => {
      if (data && sendingConnection) {
        const senderName = getSenderName(sendingConnection, subscriberWrappers) ?? '';
        const { emoji, time }: EmojiDataType = JSON.parse(data);

        const emojiWrapper: EmojiWrapper = {
          name: senderName,
          emoji,
          time,
        };
        setEmojiQueue((previousEmojiQueue) => [...previousEmojiQueue, emojiWrapper]);

        setTimeout(() => {
          setEmojiQueue((previousEmojiQueue) => previousEmojiQueue.slice(1));
        }, EMOJI_DISPLAY_DURATION);
      }
    },
    [getSenderName]
  );

  return { sendEmoji, emojiQueue, onEmoji };
};

export default useEmoji;
