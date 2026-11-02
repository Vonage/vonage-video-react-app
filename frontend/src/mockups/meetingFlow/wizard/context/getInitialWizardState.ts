import type { InviteeRole } from '../../types/InviteeRole';
import type { MeetingRecurrence } from '../../types/MeetingRecurrence';
import type { WizardStep } from '../types/WizardStep';

export type CreateRoomWizardState = ReturnType<typeof getInitialWizardState>;

/**
 * Empty draft: no name, no schedule, moderator link only.
 */
function getInitialWizardState() {
  return {
    activeStep: 'details' as WizardStep,
    name: '',
    isScheduled: false,
    date: '2026-11-09',
    time: '10:00',
    durationMinutes: 60,
    recurrence: 'none' as MeetingRecurrence,
    hasExtraRoles: false,
    selectedRoles: [] as InviteeRole[],
  };
}

export default getInitialWizardState;
