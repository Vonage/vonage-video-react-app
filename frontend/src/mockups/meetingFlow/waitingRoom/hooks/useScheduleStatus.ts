import getScheduleStatus from '../../helpers/getScheduleStatus';
import type { ScheduleStatus } from '../../types/ScheduleStatus';
import meetingSchedule$ from '../context/meetingScheduleContext';

/**
 * Current waiting-room state of the card's meeting.
 */
const useScheduleStatus = meetingSchedule$.use.createSelectorHook(
  ({ schedule, now }): ScheduleStatus => getScheduleStatus({ schedule, now })
);

export default useScheduleStatus;
