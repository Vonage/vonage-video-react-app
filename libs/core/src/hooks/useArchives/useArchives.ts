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
 * The Vonage REST API returns a `transcription` object on the archive when transcription is
 * enabled, but the `@vonage/video` SDK type does not model it.
 */
export type ArchiveTranscription = {
  status?: string;
  url?: string;
  reason?: string;
  hasSummary?: boolean;
  primaryLanguageCode?: string;
};

export type ArchiveWithTranscription = SingleArchiveResponse & {
  transcription?: ArchiveTranscription;
};

export function isPendingStatus(status: string): boolean {
  return ['requested', 'started', 'stopped', 'uploaded', 'paused'].includes(status);
}

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
  return archives.some((archive) => {
    const isArchivePending = isPendingStatus(archive.status);

    if (archive.hasTranscription && 'transcription' in archive) {
      const transcription = (archive as ArchiveWithTranscription).transcription;
      const transcriptionStatus = transcription?.status;

      if (transcriptionStatus) {
        const isTranscriptionPending = isPendingStatus(transcriptionStatus);
        return isArchivePending || isTranscriptionPending;
      }
    }

    return isArchivePending;
  });
}

export default useArchives;
