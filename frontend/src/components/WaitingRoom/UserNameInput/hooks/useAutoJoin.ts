import { useEffect, useEffectEvent } from 'react';
import isValidUserName from '@utils/isValidUserName';
import type { ScheduleStatus } from '../types/ScheduleStatus';

const useAutoJoin = ({
  isAutoJoinRequested,
  scheduleStatus,
  username,
  join,
}: {
  isAutoJoinRequested: boolean;
  scheduleStatus: ScheduleStatus;
  username: string;
  join: () => void;
}): void => {
  const shouldAutoJoin =
    isAutoJoinRequested && scheduleStatus.kind === 'started' && isValidUserName(username);

  const joinOnStart = useEffectEvent(join);

  useEffect(() => {
    if (!shouldAutoJoin) return;

    joinOnStart();
  }, [shouldAutoJoin]);
};

export default useAutoJoin;
