import { runtime$ } from '@core/stores';
import type { VideoClient } from '@core/services';
import type { QueryOptions } from '@core/types';

/**
 * Transform: createdAt number -> Date
 */
type Result = Awaited<ReturnType<VideoClient['searchArchives']['query']>>;

type Input = Parameters<VideoClient['searchArchives']['query']>[0];

export type UseArchivesProps<TData = Result> = Omit<Input, 'sessionId'> & {
  sessionKey?: string;
  queryOptions?: QueryOptions<Result, TData>;
};

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
      return await videoClient.searchArchives.query({
        sessionId: sessionKey,
        count,
        offset,
      });
    },
  });
};

export default useArchives;
