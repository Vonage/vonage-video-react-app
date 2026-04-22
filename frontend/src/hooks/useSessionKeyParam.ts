import { isValidRoomName } from '@common/assertions';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

type SessionKeyParamResult = {
  sessionKey: string;
  sessionKeyStatus: 'valid' | 'invalid' | 'legacy_hack';
};

/**
 * Custom hook to get the sessionKey from the URL params and determine its validity.
 * The sessionKey is used to identify the session/room that the user is trying to join.
 * It checks if the sessionKey is a valid JWT or a valid room name (legacy support).
 * @returns An object containing the sessionKey and its validity status.
 */
const useSessionKeyParam = (): SessionKeyParamResult => {
  const { roomIdentifier = '' } = useParams<{ roomIdentifier: string }>();

  return useMemo(() => {
    const isJWT = isJsonWebTokenLike(roomIdentifier);
    const isRoomNameValid = !isJWT && isValidRoomName(roomIdentifier);

    const sessionKeyStatus = ((): SessionKeyParamResult['sessionKeyStatus'] => {
      if (isJWT) return 'valid';
      if (isRoomNameValid) return 'legacy_hack';

      return 'invalid';
    })();

    return {
      sessionKey: roomIdentifier,
      sessionKeyStatus,
    };
  }, [roomIdentifier]);
};

function isJsonWebTokenLike(value: string): boolean {
  const parts = value.split('.');
  return parts.length === 3 && parts.every(Boolean);
}

export default useSessionKeyParam;
