import type { InviteeRole } from '../../../types/InviteeRole';
import type { SavedMeeting } from '../../../types/SavedMeeting';
import type { CreateRoomWizardState } from '../../context/getInitialWizardState';

const toDateInputValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const toTimeInputValue = (date: Date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

/**
 * Loads a saved meeting into the share step, so reopening it shows exactly what the wizard showed.
 */
function savedMeetingToWizardState(meeting: SavedMeeting): Partial<CreateRoomWizardState> {
  const selectedRoles = meeting.links
    .map(({ role }) => role)
    .filter((role): role is InviteeRole => role !== 'moderator');
  const scheduleState = meeting.schedule
    ? {
        isScheduled: true,
        date: toDateInputValue(meeting.schedule.startsAt),
        time: toTimeInputValue(meeting.schedule.startsAt),
        durationMinutes: meeting.schedule.durationMinutes,
        recurrence: meeting.schedule.recurrence,
      }
    : { isScheduled: false };

  return {
    activeStep: 'share',
    name: meeting.name ?? '',
    hasExtraRoles: selectedRoles.length > 0,
    selectedRoles,
    ...scheduleState,
  };
}

export default savedMeetingToWizardState;
