import createContext from 'react-global-state-hooks/createContext';
import actions from 'react-global-state-hooks/actions';
import type { InferAPI } from 'react-global-state-hooks';
import type { CreateRoomWizardStepName } from '../types/CreateRoomWizardStepName';
import type { MeetingDurationMinutes } from '../types/MeetingDurationMinutes';
import meetingDurationOptions from '../constants/meetingDurationOptions';
import getDefaultMeetingStart from '../helpers/getDefaultMeetingStart';

type CreateRoomWizardAPI = InferAPI<typeof createRoomWizard$>;

const internals = actions<CreateRoomWizardAPI>()({
  update(updatedValues: Partial<ReturnType<CreateRoomWizardAPI['getState']>>) {
    return ({ setState }) => {
      setState((state) => ({ ...state, ...updatedValues }));
    };
  },
});

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
        return (store): void => internals(store).update({ name });
      },
      setIsScheduled(isScheduled: boolean) {
        return (store): void => internals(store).update({ isScheduled });
      },
      setStart(start: { startDate: string; startTime: string }) {
        return (store): void => internals(store).update(start);
      },
      setDurationMinutes(durationMinutes: MeetingDurationMinutes) {
        return (store): void => internals(store).update({ durationMinutes });
      },
      showShareStep(sessionKey: string) {
        return (store): void => internals(store).update({ sessionKey, activeStep: 'share' });
      },
    },
  }
);

export default createRoomWizard$;
