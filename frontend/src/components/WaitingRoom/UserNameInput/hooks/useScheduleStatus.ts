import { useServerSettings } from '@core/hooks';
import { isNil, isNotNil } from '@common/assertions';
import type { ScheduleWindow } from '@common/types';
import getScheduleStatus from '../helpers/getScheduleStatus';
import type { ScheduleStatus } from '../types/ScheduleStatus';
import useServerNow from './useServerNow';

const serverTimeRetryMilliseconds = 10_000;

const useScheduleStatus = ({
  sessionKey,
  scheduleWindow,
}: {
  sessionKey: string;
  scheduleWindow: ScheduleWindow | null;
}): ScheduleStatus => {
  const hasSchedule = isNotNil(scheduleWindow);

  const { data: serverSettings, isError: isServerTimeUnavailable } = useServerSettings({
    sessionKey,
    queryOptions: {
      enabled: hasSchedule,
      retry: false,
      refetchInterval: (query) =>
        query.state.status === 'error' ? serverTimeRetryMilliseconds : false,
    },
  });

  const now = useServerNow({
    clockOffset: serverSettings?.clockOffset ?? 0,
    isTicking: hasSchedule,
  });

  const scheduleStatus = getScheduleStatus({ scheduleWindow, now });
  const isStartUnconfirmed =
    scheduleStatus.kind === 'started' && isNil(serverSettings) && !isServerTimeUnavailable;

  if (isStartUnconfirmed) {
    return {
      kind: 'withinFiveMinutes',
      startsAtMs: scheduleStatus.startsAtMs,
      endsAtMs: scheduleStatus.endsAtMs,
      secondsLeft: 0,
    };
  }

  return scheduleStatus;
};

export default useScheduleStatus;
