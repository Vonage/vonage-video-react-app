import { runtime$ } from '@core/stores';
import type { VideoClient } from '@core/services';
import type { QueryOptions } from '@core/types';

type Result = Awaited<ReturnType<VideoClient['searchArchives']>>;

type Input = Parameters<VideoClient['searchArchives']>[0];

export type UseArchivesProps<TData = Result> = Input & {
  queryOptions?: QueryOptions<Result, TData>;
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
const useArchives = <Selected = Result>({
  queryOptions,
  sessionKey,
  count,
  offset,
}: UseArchivesProps<Selected>) => {
  const videoClient = runtime$.useVideoClient();

  return runtime$.useQuery({
    ...queryOptions,

    queryKey: ['archives', sessionKey, count, offset],

    queryFn: async () => {
      return await videoClient.searchArchives({
        sessionKey,
        count,
        offset,
      });
    },
  });
};

export default useArchives;
