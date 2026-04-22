import { useMemo } from 'react';
import { decodeSessionKey } from '@common/helpers';
import type { Prettify, VideoSessionDetails } from '@common/types';

type DecodedSessionKey = Prettify<
  VideoSessionDetails & {
    roomName: string;
  }
>;

/**
 * Custom hook to decode the sessionKey
 */
const useDecodedSessionKey = ({
  sessionKey,
  sessionKeyStatus,
}: {
  sessionKey: string;
  sessionKeyStatus: 'valid' | 'invalid' | 'legacy_hack';
}): DecodedSessionKey => {
  return useMemo(() => {
    if (sessionKeyStatus === 'invalid') throw new Error(`Invalid sessionKey: ${sessionKey}`);
    if (sessionKeyStatus === 'valid') return decodeSessionKey({ sessionKey }) as DecodedSessionKey;

    // [TODO]: We'll be removing this after updating the other apps.
    // The intention of this changes is to keep the current and future refactor atomic as possible.
    return {
      sessionKey,
      roomName: sessionKey,
    } as DecodedSessionKey;
  }, [sessionKey, sessionKeyStatus]);
};

export default useDecodedSessionKey;
