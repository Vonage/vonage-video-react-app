import { isNil, isNotNil } from '@common/assertions';
import type { ScheduleWindow } from '@common/types';
import { serverSettings$ } from '@core/stores';
import useSessionContext from '@hooks/useSessionContext';

const endingSoonMilliseconds = 5 * 60_000;

const useShouldShowMeetingTimer = ({
  scheduleWindow,
}: {
  scheduleWindow: ScheduleWindow | null;
}): boolean => {
  const { sessionKey } = useSessionContext();
  serverSettings$.useServerSettings({
    sessionKey,
    queryOptions: { enabled: isNotNil(scheduleWindow) },
  });

  const endsAtMs = scheduleWindow?.endsAtMs;

  return serverSettings$.use.select(
    (state) => {
      const isServerTimeKnown = state.status === 'known';
      if (isNil(endsAtMs) || !isServerTimeKnown) return false;

      return state.now >= endsAtMs - endingSoonMilliseconds;
    },
    { dependencies: [endsAtMs] }
  );
};

export default useShouldShowMeetingTimer;
