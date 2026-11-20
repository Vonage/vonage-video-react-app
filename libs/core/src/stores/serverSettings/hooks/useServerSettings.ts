import runtime$ from '../../runtime';
import type { QueryOptions } from '@core/types';
import { coreQueryKeys } from '@core/constants';
import type { ServerSettingsResult } from '../types';

export type UseServerSettingsProps = {
  sessionKey: string | null;
  queryOptions?: QueryOptions<ServerSettingsResult, ServerSettingsResult>;
};

/**
 * Hook to fetch the server settings for a sessionKey.
 *
 * @example
 * const { data } = serverSettings$.useServerSettings({ sessionKey });
 */
const useServerSettings = ({ sessionKey, queryOptions }: UseServerSettingsProps) => {
  const videoClient = runtime$.useVideoClient();
  const query = runtime$.useQuery({
    queryKey: coreQueryKeys.serverSettings({ sessionKey }),
    staleTime: Infinity,
    queryFn: async function fetchServerSettings(): Promise<ServerSettingsResult> {
      const requestedAt = Date.now();
      const settings = await videoClient.getServerSettings({ sessionKey });
      const receivedAt = Date.now();

      const clockOffset = settings.serverTime - (requestedAt + receivedAt) / 2;

      return { ...settings, clockOffset };
    },
    refetchOnWindowFocus: 'always',
    ...queryOptions,
  });

  return query;
};

export default useServerSettings;
