import { isNotNil } from '@common/assertions';
import { useMeetingScheduleWindow } from '@components/MeetingRoom/MeetingTimer';

/**
 * Whether the participant is in a scheduled meeting, which is what the Meeting tab shows.
 */
const useIsMeetingTabAvailable = (): boolean => isNotNil(useMeetingScheduleWindow());

export default useIsMeetingTabAvailable;
