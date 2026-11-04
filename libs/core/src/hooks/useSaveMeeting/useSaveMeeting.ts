import { isNil } from '@common/assertions';
import type { SessionKey } from '@common/types';
import { runtime$ } from '@core/stores';
import { meetingsService, type SavedMeeting } from '@core/services';
import meetingsQueryKey from '../useMeetings/meetingsQueryKey';

/**
 * Hook to keep a meeting on this device. Saving a sessionKey that is already kept leaves its record unchanged.
 *
 * @example
 * const { mutate: saveMeeting } = useSaveMeeting();
 *
 * saveMeeting({ sessionKey });
 */
const useSaveMeeting = () => {
  return runtime$.useMutation({
    mutationFn: ({ sessionKey }: { sessionKey: SessionKey }) =>
      meetingsService.putMeeting({ sessionKey }),

    onSuccess: (savedMeeting, _variables, _onMutateResult, { client }) => {
      client.setQueryData<SavedMeeting[]>(meetingsQueryKey, (meetings) => {
        if (isNil(meetings)) return meetings;

        const otherMeetings = meetings.filter(({ id }) => id !== savedMeeting.id);

        return [...otherMeetings, savedMeeting];
      });
    },
  });
};

export default useSaveMeeting;
