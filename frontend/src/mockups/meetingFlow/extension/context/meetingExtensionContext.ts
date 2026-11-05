import createContext from 'react-global-state-hooks/createContext';

/**
 * Extension state of the running meeting as a moderator sees it. Options and cap come from `getServerSettings`.
 */
const meetingExtension$ = createContext(
  () => ({
    meetingName: 'Design review',
    scheduledEnd: new Date(2026, 10, 2, 15, 0),
    extendedMinutes: 0,
    maxTotalMinutes: 120,
    options: [20, 40, 60],
    now: new Date(2026, 10, 2, 14, 55, 8),
    isOpen: true,
  }),
  {
    actions: {
      extend(minutes: number) {
        return ({ setState }) => {
          setState((state) => ({
            ...state,
            extendedMinutes: state.extendedMinutes + minutes,
            isOpen: false,
          }));
        };
      },
      setOpen(isOpen: boolean) {
        return ({ setState }) => {
          setState((state) => ({ ...state, isOpen }));
        };
      },
    },
  }
);

export default meetingExtension$;
