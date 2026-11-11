import type { ScheduleWindow } from '@common/types';
import { serverSettings$ } from '@core/stores';
import useSessionContext from '@hooks/useSessionContext';

const useMeetingSecondsLeft = ({ scheduleWindow }: { scheduleWindow: ScheduleWindow }): number => {
  const { sessionKey } = useSessionContext();
  serverSettings$.useServerSettings({ sessionKey });

  const { endsAtMs } = scheduleWindow;

  return serverSettings$.use.select(
    (state) => Math.max(0, Math.ceil((endsAtMs - state.now) / 1000)),
    { dependencies: [endsAtMs] }
  );
};

export default useMeetingSecondsLeft;
