import { useEffect } from 'react';
import { useSaveMeeting } from '@core/hooks';
import type { SessionKey } from '@common/types';

const useAutoSaveMeeting = ({
  sessionKey,
  sessionKeyStatus,
}: {
  sessionKey: string;
  sessionKeyStatus: 'valid' | 'invalid' | 'legacy_hack';
}) => {
  const { mutate: saveMeeting } = useSaveMeeting();

  useEffect(() => {
    if (sessionKeyStatus !== 'valid') return;

    saveMeeting({ sessionKey: sessionKey as SessionKey });
  }, [sessionKey, sessionKeyStatus, saveMeeting]);
};

export default useAutoSaveMeeting;
