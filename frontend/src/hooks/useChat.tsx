import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useUserContext from './useUserContext';
import { ChatMessageType } from '../types/chat';
import { SignalType } from '../types/session';
import frontendLogger from '../logger';

export type ChatSendErrorType = {
  header: string;
  caption: string;
} | null;

export type UseChatProps = {
  signal: ((data: SignalType) => Promise<void>) | undefined;
  reconnecting: boolean | null;
};

export type UseChat = {
  messages: ChatMessageType[];
  onChatMessage: (data: string) => void;
  sendChatMessage: (text: string) => Promise<void>;
  chatSendError: ChatSendErrorType;
};
/**
 * React hook to store ChatMessage array in state and provider functions for sending and receiving chat messages
 * @param {UseChatProps} props - props for the hook
 *  @property {((data: SignalType) => Promise<void>) | undefined} signal - function to send signal to all participants
 *  @property {boolean | null} reconnecting - whether the session is currently reconnecting
 * @returns {UseChat} return object
 *   @property {ChatMessageType[]} messages - array of chat messages
 *   @property {(data: string) => void} onChatMessage - new message handler
 *   @property {(text: string) => Promise<void>} sendChatMessage - function to send message
 *   @property {ChatSendErrorType} chatSendError - error state for a failed chat send
 */
const useChat = ({ signal, reconnecting }: UseChatProps): UseChat => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [chatSendError, setChatSendError] = useState<ChatSendErrorType>(null);
  const reconnectingRef = useRef(false);
  reconnectingRef.current = reconnecting === true;
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
        setChatSendError(null);
      } catch (err) {
        if (reconnectingRef.current) return;
        frontendLogger.reportError(err, { eventSource: 'useChat.sendChatMessage' });
        setChatSendError({
          header: t('chatErrors.sendFailed.title'),
          caption: t('chatErrors.sendFailed.message'),
        });
      }
    },
    [signal, localParticipantName, t]
  );

  const onChatMessage = useCallback(
    (data: string) => {
      if (data) {
        try {
          const { text, participantName } = JSON.parse(data);
          const message: ChatMessageType = {
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
    chatSendError,
  };
};

export default useChat;
