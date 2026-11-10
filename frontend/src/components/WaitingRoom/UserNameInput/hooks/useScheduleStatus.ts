import { shallowCompare } from 'react-global-state-hooks';
import { isNotNil } from '@common/assertions';
import type { ScheduleWindow } from '@common/types';
import { serverSettings$ } from '@core/stores';
import getScheduleStatus from '../helpers/getScheduleStatus';
import type { ScheduleStatus } from '../types/ScheduleStatus';

const serverTimeRetryMilliseconds = 10_000;

const useScheduleStatus = ({
  sessionKey,
  scheduleWindow,
}: {
  sessionKey: string;
  scheduleWindow: ScheduleWindow | null;
}): ScheduleStatus => {
  const hasSchedule = isNotNil(scheduleWindow);

  serverSettings$.useServerSettings({
    sessionKey,
    queryOptions: {
      enabled: hasSchedule,
      retry: false,
      refetchInterval: (query) =>
        query.state.status === 'error' ? serverTimeRetryMilliseconds : false,
    },
  });

  const startsAtMs = scheduleWindow?.startsAtMs;
  const endsAtMs = scheduleWindow?.endsAtMs;

  return serverSettings$.use.select(
    (state): ScheduleStatus => {
      const scheduleStatus = getScheduleStatus({ scheduleWindow, now: state.now });

      const isStartUnconfirmed = scheduleStatus.kind === 'started' && state.status === 'pending';

      if (!isStartUnconfirmed) return scheduleStatus;

      return {
        kind: 'withinFiveMinutes',
        startsAtMs: scheduleStatus.startsAtMs,
        endsAtMs: scheduleStatus.endsAtMs,
        secondsLeft: 0,
      };
    },
    { dependencies: [startsAtMs, endsAtMs], isEqual: shallowCompare }
  );
};

export default useScheduleStatus;
