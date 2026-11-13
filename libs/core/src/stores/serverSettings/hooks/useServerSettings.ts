import { useLayoutEffect, useMemo } from 'react';
import { isNil } from '@common/assertions';
import runtime$ from '../../runtime';
import type { QueryOptions } from '@core/types';
import { coreQueryKeys } from '@core/constants';
import serverSettings$ from '../serverSettings$';
import internalActions from '../actions/internalActions';
import type { ServerSettingsResult } from '../types';

export type UseServerSettingsProps = {
  sessionKey: string | null;
  queryOptions?: QueryOptions<ServerSettingsResult, ServerSettingsResult>;
};

/**
 * Hook to fetch the server settings for a sessionKey and update the store's server time with the answer.
 *
 * @example
 * const { data } = serverSettings$.useServerSettings({ sessionKey });
 */
const useServerSettings = ({ sessionKey, queryOptions }: UseServerSettingsProps) => {
  const videoClient = runtime$.useVideoClient();
  const storeApi = serverSettings$.use.api();
  const { applyClockOffset, markUnavailable } = useMemo(
    () => internalActions(storeApi),
    [storeApi]
  );

  const query = runtime$.useQuery({
    queryKey: coreQueryKeys.serverSettings({ sessionKey }),
    staleTime: Infinity,
    queryFn: async (): Promise<ServerSettingsResult> => {
      const requestedAt = Date.now();
      const settings = await videoClient.getServerSettings({ sessionKey: sessionKey ?? undefined });
      const receivedAt = Date.now();

      const clockOffset = settings.serverTime - (requestedAt + receivedAt) / 2;

      return { ...settings, clockOffset };
    },
    refetchOnWindowFocus: 'always',
    ...queryOptions,
  });

  const { data, isError } = query;
  const hasFailedWithoutData = isError && isNil(data);

  useLayoutEffect(
    function syncServerClock() {
      if (data) {
        applyClockOffset(data.clockOffset);
        return;
      }

      if (hasFailedWithoutData) markUnavailable();
    },
    [data, hasFailedWithoutData, applyClockOffset, markUnavailable]
  );

  return query;
};

export default useServerSettings;
