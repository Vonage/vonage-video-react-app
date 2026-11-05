import { useServerSettings } from '@core/hooks';
import { isNil, isNotNil } from '@common/assertions';
import type { ScheduleWindow } from '@common/types';
import getScheduleStatus from '../helpers/getScheduleStatus';
import type { ScheduleStatus } from '../types/ScheduleStatus';
import useServerNow from './useServerNow';

/**
 * Waiting-room state of a meeting, kept current by the server clock.
 */
const useScheduleStatus = ({
  sessionKey,
  scheduleWindow,
}: {
  sessionKey: string;
  scheduleWindow: ScheduleWindow | null;
}): ScheduleStatus => {
  const hasSchedule = isNotNil(scheduleWindow);

  const { data: serverSettings } = useServerSettings({
    sessionKey,
    queryOptions: { enabled: hasSchedule },
  });

  const now = useServerNow({
    clockOffset: serverSettings?.clockOffset ?? 0,
    isTicking: hasSchedule,
  });

  const scheduleStatus = getScheduleStatus({ scheduleWindow, now });
  const isStartUnconfirmed = scheduleStatus.kind === 'started' && isNil(serverSettings);

  if (isStartUnconfirmed) {
    return {
      kind: 'withinFiveMinutes',
      startsAt: scheduleStatus.startsAt,
      endsAt: scheduleStatus.endsAt,
      secondsLeft: 0,
    };
  }

  return scheduleStatus;
};

export default useScheduleStatus;
