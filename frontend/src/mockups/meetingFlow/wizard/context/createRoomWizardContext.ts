import createContext from 'react-global-state-hooks/createContext';
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
  },
});

export default createRoomWizard$;
