import { runtime$ } from '@core/stores';
import { meetingsService, type SavedMeeting } from '@core/services';
import type { QueryOptions } from '@core/types';
import meetingsQueryKey from './meetingsQueryKey';

export type UseMeetingsProps<TData = SavedMeeting[]> = {
  queryOptions?: QueryOptions<SavedMeeting[], TData>;
};

/**
 * Hook to read the meetings kept on this device. Archived meetings past their retention are purged first.
 *
 * @example
 * const { data, error, isLoading } = useMeetings();
 *
 * console.log(data); // [{ id: 'meeting:…', sessionKey: '…', savedAt: 1730000000000, archivedAt: null }]
 */
const useMeetings = <Selected = SavedMeeting[]>({
  queryOptions,
}: UseMeetingsProps<Selected> = {}) => {
  return runtime$.useQuery({
    queryKey: meetingsQueryKey,

    queryFn: async () => {
      await meetingsService.purgeArchivedMeetings();

      return await meetingsService.listMeetings();
    },

    ...queryOptions,
  });
};

export default useMeetings;
