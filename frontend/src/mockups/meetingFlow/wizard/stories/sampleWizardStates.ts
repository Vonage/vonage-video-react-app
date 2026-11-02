import type { CreateRoomWizardState } from '../context/getInitialWizardState';

const scheduledDetails: Partial<CreateRoomWizardState> = {
  name: 'Customer onboarding: Acme',
  isScheduled: true,
  date: '2026-11-05',
  time: '16:00',
  durationMinutes: 60,
  recurrence: 'weekly',
};

/**
 * Draft states used by the wizard stories.
 */
const sampleWizardStates = {
  detailsScheduled: { ...scheduledDetails, activeStep: 'details' },
  detailsUnscheduled: { name: 'Open help desk', activeStep: 'details' },
  roles: {
    ...scheduledDetails,
    activeStep: 'roles',
    hasExtraRoles: true,
    selectedRoles: ['publisher', 'subscriber'],
  },
  share: {
    ...scheduledDetails,
    activeStep: 'share',
    hasExtraRoles: true,
    selectedRoles: ['publisher', 'subscriber'],
  },
} satisfies Record<string, Partial<CreateRoomWizardState>>;

export default sampleWizardStates;
