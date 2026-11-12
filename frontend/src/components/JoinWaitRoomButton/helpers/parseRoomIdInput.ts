import { isValidRoomName, isValidSessionKey } from '@common/assertions';

const parseRoomIdInput = (input: string): string | null => {
  const trimmedInput = input.trim();
  const roomName = trimmedInput.toLowerCase();

  if (isValidSessionKey(trimmedInput)) return trimmedInput;
  if (isValidRoomName(roomName)) return roomName;

  return null;
};

export default parseRoomIdInput;
