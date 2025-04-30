import { Session } from '@vonage/client-sdk-video';
import { RefObject, useCallback, useState } from 'react';
import useUserContext from './useUserContext';
import { ChatMessageType } from '../types/chat';

export type UseChatProps = {
  sessionRef: RefObject<Session | null>;
};

export type UseChat = {
  messages: ChatMessageType[];
  onChatMessage: (data: string) => void;
  sendChatMessage: (text: string) => void;
};
/**
 * React hook to store ChatMessage array in state and provider functions for sending and receiving chat messages
 * @param {UseChatProps} props - props for the hook
 *   @property {RefObject<Session | null>} sessionRef - reference to the Session object
 * @returns {UseChat} return object
 *   @property {ChatMessageType[]} messages - array of chat messages
 *   @property {(data: string) => void} onChatMessage - new message handler
 *   @property {(text: string) => void} sendChatMessage - function to send message
 */
const useChat = ({ sessionRef }: UseChatProps): UseChat => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const {
    user: {
      defaultSettings: { name: localParticipantName },
    },
  } = useUserContext();

  const sendChatMessage = useCallback(
    (text: string) => {
      if (sessionRef.current) {
        sessionRef.current.signal({
          type: 'chat',
          data: JSON.stringify({
            participantName: localParticipantName,
            text,
          }),
        });
      }
    },
    [localParticipantName, sessionRef]
  );

  const onChatMessage = useCallback((data: string) => {
    if (data) {
      try {
        const { text, participantName } = JSON.parse(data);
        const message: ChatMessageType = {
          timestamp: Date.now(),
          participantName: `${participantName || 'unknown user'}`,
          message: text,
        };
        setMessages((prev) => [...prev, message]);
      } catch (err) {
        console.log(err);
      }
    }
  }, []);

  return {
    messages,
    onChatMessage,
    sendChatMessage,
  };
};

export default useChat;
