import { useEffect, useEffectEvent } from 'react';
import isValidUserName from '@utils/isValidUserName';
import type { ScheduleStatus } from '../types/ScheduleStatus';

/**
 * Runs `join` when a scheduled meeting starts by server time, if auto-join is ticked and the name is valid.
 */
const useAutoJoin = ({
  isAutoJoinChecked,
  scheduleStatus,
  username,
  join,
}: {
  isAutoJoinChecked: boolean;
  scheduleStatus: ScheduleStatus;
  username: string;
  join: () => void;
}): void => {
  const shouldAutoJoin =
    isAutoJoinChecked && scheduleStatus.kind === 'started' && isValidUserName(username);

  const joinOnStart = useEffectEvent(join);

  useEffect(() => {
    if (!shouldAutoJoin) return;

    joinOnStart();
  }, [shouldAutoJoin]);
};

export default useAutoJoin;
