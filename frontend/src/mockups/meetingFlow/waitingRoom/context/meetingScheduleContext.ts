import createContext from 'react-global-state-hooks/createContext';
import mockupNow from '../../sampleData/mockupNow';
import type { MeetingSchedule } from '../../types/MeetingSchedule';

/**
 * Schedule-aware state of one "Prepare to join" card. `now` comes from the server clock in the real feature.
 */
const meetingSchedule$ = createContext(
  () => ({
    meetingName: 'Design review',
    schedule: null as MeetingSchedule | null,
    now: mockupNow,
    username: '',
    isAutoJoinEnabled: false,
  }),
  {
    actions: {
      setUsername(username: string) {
        return ({ setState }) => {
          setState((state) => ({ ...state, username }));
        };
      },
      setAutoJoinEnabled(isAutoJoinEnabled: boolean) {
        return ({ setState }) => {
          setState((state) => ({ ...state, isAutoJoinEnabled }));
        };
      },
    },
  }
);

export default meetingSchedule$;
