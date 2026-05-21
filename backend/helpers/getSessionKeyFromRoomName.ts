import { makeNotFoundErrorHandler } from '@api-lib/errors';
import getSessionStorageService from '../sessionStorageService';

const sessionService = getSessionStorageService();

const getSessionKeyFromRoomName = async ({ roomName }: { roomName: string }): Promise<string> => {
  const storedSessionKey = await sessionService.getSessionKeyByRoomName({ roomName });

  if (!storedSessionKey) {
    throw makeNotFoundErrorHandler(`No session found for room name: ${roomName}`)(null);
  }

  return storedSessionKey;
};

export default getSessionKeyFromRoomName;
