import { isNil } from '@common/assertions';
import type { ScheduleWindow } from '@common/types';
import { serverSettings$ } from '@core/stores';

const useMeetingSecondsLeft = ({
  scheduleWindow,
}: {
  scheduleWindow: ScheduleWindow;
}): number | null => {
  const { endsAtMs } = scheduleWindow;

  return serverSettings$.use.select(
    (state) => {
      if (isNil(state.now)) return null;

      return Math.max(0, Math.ceil((endsAtMs - state.now) / 1000));
    },
    { dependencies: [endsAtMs] }
  );
};

export default useMeetingSecondsLeft;
