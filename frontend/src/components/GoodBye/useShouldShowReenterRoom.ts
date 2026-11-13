import { useMemo } from 'react';
import useSessionKeyParam from '@hooks/useSessionKeyParam';
import { decodeSessionKey } from '@common/helpers';
import { isNil } from '@common/assertions';
import { serverSettings$ } from '@core/stores';

const useShouldShowReenterRoom = (): boolean => {
  const { sessionKey, sessionKeyStatus } = useSessionKeyParam();
  const scheduleWindow = useMemo(() => {
    if (sessionKeyStatus !== 'valid') return null;

    return decodeSessionKey({ sessionKey }).schedule ?? null;
  }, [sessionKey, sessionKeyStatus]);
  const endsAtMs = scheduleWindow?.endsAtMs;
  return serverSettings$.use.select(
    (state) =>
      Boolean(sessionKey) &&
      (isNil(endsAtMs) || (state.status === 'known' && state.now < endsAtMs)),
    { dependencies: [sessionKey, endsAtMs] }
  );
};

export default useShouldShowReenterRoom;
