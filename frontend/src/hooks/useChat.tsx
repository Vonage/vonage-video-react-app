import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useUserContext from './useUserContext';
import { ChatMessageType } from '../types/chat';
import { SignalType } from '../types/session';

export type UseChatProps = {
  signal: ((data: SignalType) => void) | undefined;
};

export type UseChat = {
  messages: ChatMessageType[];
  onChatMessage: (data: string) => void;
  sendChatMessage: (text: string) => void;
};
/**
 * React hook to store ChatMessage array in state and provider functions for sending and receiving chat messages
 * @param {UseChatProps} props - props for the hook
 *  @property {((data: SignalType) => void) | undefined} signal - function to send signal to all participants
 * @returns {UseChat} return object
 *   @property {ChatMessageType[]} messages - array of chat messages
 *   @property {(data: string) => void} onChatMessage - new message handler
 *   @property {(text: string) => void} sendChatMessage - function to send message
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
    (text: string) => {
      if (!signal) {
        return;
      }

      signal({
        type: 'chat',
        data: JSON.stringify({
          participantName: localParticipantName,
          text,
        }),
      });
    },
    [signal, localParticipantName]
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
  };
};

export default useChat;
