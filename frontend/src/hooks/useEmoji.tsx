import { useCallback, useEffect, useMemo, useState } from 'react';
import { Connection } from '@vonage/client-sdk-video';
import { throttle } from 'lodash';
import useSessionContext from './useSessionContext';
import { EMOJI_DISPLAY_DURATION } from '../utils/constants';

type SignalEventType = {
  type?: string;
  data?: string;
  from: Connection | null;
};

type EmojiDataType = {
  emoji: string;
  time: number;
};

export type EmojiWrapper = {
  name: string;
  emoji: string;
  time: number;
};

const useEmoji = () => {
  const { session, subscriberWrappers } = useSessionContext();
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
        session?.signal({ type: 'emoji', data }, () => {});
      },
      500,
      { leading: true, trailing: false }
    );
    return throttledFunc;
  }, [session]);

  /**
   * Checks if the given connection belongs to the current user.
   * @param {Connection} sendingConnection - The connection of a user.
   * @returns {boolean} - Returns `true` if the connection is the current user's, else `false`.
   */
  const getIsYourConnection = useCallback(
    (sendingConnection: Connection): boolean => {
      const yourConnection = session?.connectionId;

      return sendingConnection.connectionId === yourConnection;
    },
    [session?.connectionId]
  );

  /**
   * Retrieves the user's name or `You` if you are the sender from a given Connection.
   * @param {Connection} sendingConnection - The connection object to evaluate.
   * @returns {string} The user's name, `You`, or an empty string.
   */
  const getSenderName = useCallback(
    (sendingConnection: Connection): string | undefined => {
      const isYou = getIsYourConnection(sendingConnection);
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
    [getIsYourConnection, subscriberWrappers]
  );

  /**
   * Manages signals sent by users in the room. Any emojis sent by the room's users
   * are processed in a data queue to be rendered in the application.
   * @param {SignalEventType} signalEvent - Signal event dispatched by the session.
   */
  const emojiHandler = useCallback(
    ({ type, data, from: sendingConnection }: SignalEventType) => {
      if (type !== 'signal:emoji') {
        return;
      }
      if (data && sendingConnection) {
        const senderName = getSenderName(sendingConnection) ?? '';
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

  useEffect(() => {
    session?.on('signal', emojiHandler);

    return () => {
      session?.off('signal', emojiHandler);
    };
  }, [emojiHandler, session]);

  return { sendEmoji, emojiQueue };
};

export default useEmoji;
