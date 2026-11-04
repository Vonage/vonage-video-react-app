import createContext from 'react-global-state-hooks/createContext';
import type { CreateRoomWizardStepName } from '../types/CreateRoomWizardStepName';
import type { MeetingDurationMinutes } from '../types/MeetingDurationMinutes';
import meetingDurationOptions from '../constants/meetingDurationOptions';
import getDefaultMeetingStart from '../helpers/getDefaultMeetingStart';

/**
 * The meeting being created and the wizard step on screen. One instance per open wizard.
 */
const createRoomWizard$ = createContext(
  () => ({
    activeStep: 'details' as CreateRoomWizardStepName,
    sessionKey: '',
    name: '',
    isScheduled: false,
    ...getDefaultMeetingStart({ now: Date.now() }),
    durationMinutes: meetingDurationOptions[0] as MeetingDurationMinutes,
  }),
  {
    actions: {
      setName(name: string) {
        return ({ setState }) => {
          setState((state) => ({ ...state, name }));
        };
      },
      setIsScheduled(isScheduled: boolean) {
        return ({ setState }) => {
          setState((state) => ({ ...state, isScheduled }));
        };
      },
      setStart(start: { startDate: string; startTime: string }) {
        return ({ setState }) => {
          setState((state) => ({ ...state, ...start }));
        };
      },
      setDurationMinutes(durationMinutes: MeetingDurationMinutes) {
        return ({ setState }) => {
          setState((state) => ({ ...state, durationMinutes }));
        };
      },
      showShareStep(sessionKey: string) {
        return ({ setState }) => {
          setState((state) => ({ ...state, sessionKey, activeStep: 'share' }));
        };
      },
    },
  }
);

export default createRoomWizard$;
