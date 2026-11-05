import { useMemo } from 'react';
import { isNil } from '@common/assertions';
import { SessionKeyClaim } from '@common/constants';
import { getScheduleWindow, readScheduleClaim } from '@common/helpers';
import type { ScheduleWindow } from '@common/types';
import useSessionContext from '@hooks/useSessionContext';

const useMeetingScheduleWindow = (): ScheduleWindow | null => {
  const { sessionDetails } = useSessionContext();

  return useMemo(() => {
    if (isNil(sessionDetails)) return null;

    const scheduleClaim = readScheduleClaim(sessionDetails);
    if (isNil(scheduleClaim)) return null;

    return getScheduleWindow({
      sessionId: sessionDetails.sessionId,
      [SessionKeyClaim.schedule]: scheduleClaim,
    });
  }, [sessionDetails]);
};

export default useMeetingScheduleWindow;
