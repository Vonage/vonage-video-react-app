import createRoomWizard$ from '../context/createRoomWizardContext';
import type { MeetingSchedule } from '../../types/MeetingSchedule';

const useDraftScheduleParts = createRoomWizard$.use.createSelectorHook(
  ({ isScheduled, date, time, durationMinutes, recurrence }) => ({
    isScheduled,
    date,
    time,
    durationMinutes,
    recurrence,
  })
);

/**
 * The schedule being drafted in the wizard, or `null` when the meeting has none.
 */
const useDraftSchedule = (): MeetingSchedule | null => {
  const { isScheduled, date, time, durationMinutes, recurrence } = useDraftScheduleParts();

  if (!isScheduled) return null;

  return { startsAt: new Date(`${date}T${time}`), durationMinutes, recurrence };
};

export default useDraftSchedule;
