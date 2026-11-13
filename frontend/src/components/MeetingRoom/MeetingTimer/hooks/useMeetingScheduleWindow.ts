import type { ScheduleWindow } from '@common/types';
import useSessionContext from '@hooks/useSessionContext';

const useMeetingScheduleWindow = (): ScheduleWindow | null => {
  const { sessionDetails } = useSessionContext();

  return sessionDetails?.schedule ?? null;
};

export default useMeetingScheduleWindow;
