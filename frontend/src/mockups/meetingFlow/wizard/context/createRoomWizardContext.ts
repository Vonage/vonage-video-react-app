import createContext from 'react-global-state-hooks/createContext';
import type { InviteeRole } from '../../types/InviteeRole';
import type { MeetingRecurrence } from '../../types/MeetingRecurrence';
import type { WizardStep } from '../types/WizardStep';
import wizardSteps from '../constants/wizardSteps';
import getInitialWizardState from './getInitialWizardState';

/**
 * Draft of the meeting being created and the wizard step on screen. One instance per open wizard.
 */
const createRoomWizard$ = createContext(getInitialWizardState, {
  actions: {
    goToStep(activeStep: WizardStep) {
      return ({ setState }) => {
        setState((state) => ({ ...state, activeStep }));
      };
    },
    goNext() {
      return ({ setState }) => {
        setState((state) => {
          const nextStep = wizardSteps[wizardSteps.indexOf(state.activeStep) + 1];
          return { ...state, activeStep: nextStep ?? state.activeStep };
        });
      };
    },
    goBack() {
      return ({ setState }) => {
        setState((state) => {
          const previousStep = wizardSteps[wizardSteps.indexOf(state.activeStep) - 1];
          return { ...state, activeStep: previousStep ?? state.activeStep };
        });
      };
    },
    setName(name: string) {
      return ({ setState }) => {
        setState((state) => ({ ...state, name }));
      };
    },
    setScheduled(isScheduled: boolean) {
      return ({ setState }) => {
        setState((state) => ({ ...state, isScheduled }));
      };
    },
    setStart(start: { date: string; time: string }) {
      return ({ setState }) => {
        setState((state) => ({ ...state, ...start }));
      };
    },
    setDurationMinutes(durationMinutes: number) {
      return ({ setState }) => {
        setState((state) => ({ ...state, durationMinutes }));
      };
    },
    setRecurrence(recurrence: MeetingRecurrence) {
      return ({ setState }) => {
        setState((state) => ({ ...state, recurrence }));
      };
    },
    setHasExtraRoles(hasExtraRoles: boolean) {
      return ({ setState }) => {
        setState((state) => ({ ...state, hasExtraRoles }));
      };
    },
    toggleRole(role: InviteeRole) {
      return ({ setState }) => {
        setState((state) => {
          const isSelected = state.selectedRoles.includes(role);
          const selectedRoles = isSelected
            ? state.selectedRoles.filter((selectedRole) => selectedRole !== role)
            : [...state.selectedRoles, role];

          return { ...state, selectedRoles };
        });
      };
    },
  },
});

export default createRoomWizard$;
