import createRoomWizard$ from '../context/createRoomWizardContext';
import isMeetingStartValid from '../helpers/isMeetingStartValid';

/**
 * True when the meeting has no schedule, or when its start is filled in and not in the past.
 */
const useIsMeetingStartValid = createRoomWizard$.use.createSelectorHook(
  ({ isScheduled, startDate, startTime }): boolean =>
    !isScheduled || isMeetingStartValid({ startDate, startTime, now: Date.now() })
);

export default useIsMeetingStartValid;
