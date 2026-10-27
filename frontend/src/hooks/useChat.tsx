import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useUserContext from './useUserContext';
import type { ChatMessageType, ChatMessageId } from '../types/chat';
import { SignalType } from '../types/session';
import { notifications$ } from '@core/stores';
import { env } from '../env';

export type UseChatProps = {
  signal: ((data: SignalType) => Promise<void>) | undefined;
};

export type UseChat = {
  messages: ChatMessageType[];
  onChatMessage: (data: string) => void;
  sendChatMessage: (text: string) => Promise<void>;
};

function createChatMessageId(): ChatMessageId {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID() as ChatMessageId;
  }

  const array = new Uint32Array(4);
  window.crypto.getRandomValues(array);
  return Array.from(array, (value) => value.toString(16)).join('') as ChatMessageId;
}

/**
 * React hook to store ChatMessage array in state and provider functions for sending and receiving chat messages
 * @param {UseChatProps} props - props for the hook
 *  @property {((data: SignalType) => Promise<void>) | undefined} signal - function to send signal to all participants
 * @returns {UseChat} return object
 *   @property {ChatMessageType[]} messages - array of chat messages
 *   @property {(data: string) => void} onChatMessage - new message handler
 *   @property {(text: string) => Promise<void>} sendChatMessage - function to send message
 */
const useChat = ({ signal }: UseChatProps): UseChat => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const {
    user: {
      defaultSettings: { name: localParticipantName },
    },
  } = useUserContext();

  const sendChatMessage = useCallback(
    async (text: string) => {
      if (!signal) {
        return;
      }

      try {
        await signal({
          type: 'chat',
          data: JSON.stringify({
            participantName: localParticipantName,
            text,
          }),
          retryAfterReconnect: true,
        });
      } catch {
        notifications$.actions.push({
          type: 'error',
          message: t('chatErrors.sendFailed'),
          expirationMs: env.NOTIFICATION_DURATION_MS,
        });
      }
    },
    [signal, localParticipantName, t]
  );

  const onChatMessage = useCallback(
    (data: string) => {
      if (data) {
        const id = createChatMessageId();

        try {
          const { text, participantName } = JSON.parse(data);
          const message: ChatMessageType = {
            id,
            timestamp: Date.now(),
            participantName: participantName || t('user.unknown'),
            message: text,
          };
          setMessages((prev) => [...prev, message]);
        } catch (err) {
          console.log(err);
        }
      }
    },
    [t]
  );

  return {
    messages,
    onChatMessage,
    sendChatMessage,
  };
};

export default useChat;
