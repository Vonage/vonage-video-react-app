import { shallowCompare } from 'react-global-state-hooks';
import { isNil } from '@common/assertions';
import type { ScheduleWindow } from '@common/types';
import { serverSettings$ } from '@core/stores';
import getScheduleStatus from '../helpers/getScheduleStatus';
import type { ScheduleStatus } from '../types/ScheduleStatus';

const useScheduleStatus = ({
  scheduleWindow,
}: {
  scheduleWindow: ScheduleWindow | null;
}): ScheduleStatus => {
  const startsAtMs = scheduleWindow?.startsAtMs;
  const endsAtMs = scheduleWindow?.endsAtMs;

  return serverSettings$.use.select(
    (state): ScheduleStatus => {
      if (isNil(scheduleWindow)) return { kind: 'unscheduled' };
      if (state.status !== 'known') return { ...scheduleWindow, kind: 'pending' };

      return getScheduleStatus({ scheduleWindow, now: state.now });
    },
    { dependencies: [startsAtMs, endsAtMs], isEqual: shallowCompare }
  );
};

export default useScheduleStatus;
