import { runtime$ } from '@core/stores';
import type { VideoClient } from '@core/services';
import type { QueryOptions } from '@core/types';

type ServerSettings = Awaited<ReturnType<VideoClient['getServerSettings']>>;

export type ServerSettingsResult = ServerSettings & {
  /**
   * Milliseconds to add to `Date.now()` to get the server time.
   */
  clockOffset: number;
};

export type UseServerSettingsProps<TData = ServerSettingsResult> = {
  queryOptions?: QueryOptions<ServerSettingsResult, TData>;
};

/**
 * Hook to read the public server settings and the offset between the local and the server clock.
 *
 * @example
 * const { data } = useServerSettings();
 *
 * const serverNow = Date.now() + (data?.clockOffset ?? 0);
 */
const useServerSettings = <Selected = ServerSettingsResult>({
  queryOptions,
}: UseServerSettingsProps<Selected> = {}) => {
  const videoClient = runtime$.useVideoClient();

  return runtime$.useQuery({
    queryKey: ['serverSettings'],
    staleTime: Infinity,
    queryFn: async (): Promise<ServerSettingsResult> => {
      const requestedAt = Date.now();
      const settings = await videoClient.getServerSettings();
      const receivedAt = Date.now();

      const clockOffset = settings.serverTime - (requestedAt + receivedAt) / 2;

      return { ...settings, clockOffset };
    },
    ...queryOptions,
  });
};

export default useServerSettings;
