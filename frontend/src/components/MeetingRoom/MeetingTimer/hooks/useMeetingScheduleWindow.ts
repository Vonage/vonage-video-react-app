import { useMemo } from 'react';
import { isNil } from '@common/assertions';
import { readScheduleClaim } from '@common/helpers';
import type { ScheduleWindow } from '@common/types';
import useSessionContext from '@hooks/useSessionContext';

const useMeetingScheduleWindow = (): ScheduleWindow | null => {
  const { sessionDetails } = useSessionContext();

  return useMemo(() => {
    if (isNil(sessionDetails)) return null;

    return readScheduleClaim(sessionDetails);
  }, [sessionDetails]);
};

export default useMeetingScheduleWindow;
