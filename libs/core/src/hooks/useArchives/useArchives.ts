import { runtime$ } from '@core/stores';
import type { VideoClient } from '@core/services';
import type { QueryOptions } from '@core/types';
import { SingleArchiveResponse } from '@vonage/video';

const pollingIntervalMs = 5000;

export type SearchArchivesResult = Awaited<ReturnType<VideoClient['searchArchives']>>;

type Input = Parameters<VideoClient['searchArchives']>[0];

export type UseArchivesProps<TData = SearchArchivesResult> = Input & {
  queryOptions?: QueryOptions<SearchArchivesResult, TData>;
};

/**
 * Hook to search for archives.
 *
 * @example
 * const { data, error, isLoading } = useArchives({
 *   sessionKey: 'room-1',
 *   count: 10,
 *   offset: 0
 * });
 *
 * console.log(data); // { items: [...], count: 100 }
 * console.log(error); // null or Error
 * console.log(isLoading); // boolean
 */
const useArchives = <Selected = SearchArchivesResult>({
  queryOptions,
  sessionKey,
  count,
  offset,
}: UseArchivesProps<Selected>) => {
  const videoClient = runtime$.useVideoClient();

  return runtime$.useQuery({
    queryKey: ['archives', sessionKey, count, offset],

    refetchInterval: (query) => {
      const archives = query.state.data?.items;

      if (!archives || !hasPending(archives)) {
        return false;
      }

      return pollingIntervalMs;
    },

    queryFn: async () => {
      return await videoClient.searchArchives({
        sessionKey,
        count,
        offset,
      });
    },

    ...queryOptions,
  });
};

function hasPending<T extends SingleArchiveResponse>(archives: T[]): boolean {
  return archives.some((archive) => !['available', 'failed'].includes(archive.status));
}

export default useArchives;
