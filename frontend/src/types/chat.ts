declare const ChatMessageIdBrand: unique symbol;

export type ChatMessageId = string & {
  readonly [ChatMessageIdBrand]: 'ChatMessageId';
};

export type ChatMessageType = {
  id: ChatMessageId;
  participantName: string;
  timestamp: number;
  message: string;
};
