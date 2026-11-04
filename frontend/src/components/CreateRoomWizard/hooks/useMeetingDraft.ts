import createRoomWizard$ from '../context/createRoomWizardContext';
import type { MeetingDraft } from '../types/MeetingDraft';

/**
 * The name and schedule entered in the details step.
 */
const useMeetingDraft = createRoomWizard$.use.createSelectorHook(
  ({ name, isScheduled, startDate, startTime, durationMinutes }): MeetingDraft => ({
    name,
    isScheduled,
    startDate,
    startTime,
    durationMinutes,
  })
);

export default useMeetingDraft;
