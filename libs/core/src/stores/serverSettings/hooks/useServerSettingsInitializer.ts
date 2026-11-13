import { useCallback, useMemo } from 'react';
import { decodeSessionKey } from '@common/helpers';
import { isNil } from '@common/assertions';
import type { ServerSettingsState } from '../types';
import useServerSettings from './useServerSettings';

function useServerSettingsInitializer(sessionKey: string | null) {
  const scheduleWindow = useMemo(
    function decodeSchedule() {
      if (isNil(sessionKey)) return null;

      return decodeSessionKey({ sessionKey }).schedule ?? null;
    },
    [sessionKey]
  );
  const { data, isError } = useServerSettings({
    sessionKey,
    queryOptions: {
      retry: false,
      refetchInterval: function retryUnavailableSettings(query) {
        return query.state.status === 'error' ? 10_000 : false;
      },
    },
  });

  return useCallback(
    function initializeServerSettings(): ServerSettingsState {
      if (data) {
        const { clockOffset } = data;
        return { status: 'known', clockOffset, now: Date.now() + clockOffset, scheduleWindow };
      }

      if (isError)
        return { status: 'unavailable', clockOffset: null, now: Date.now(), scheduleWindow };

      return { status: 'pending', clockOffset: null, now: null, scheduleWindow };
    },
    [scheduleWindow, data, isError]
  );
}

export default useServerSettingsInitializer;
