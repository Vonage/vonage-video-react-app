import createContext from 'react-global-state-hooks/createContext';

export type ManageMeetingsTab = 'upcoming' | 'archived' | 'backup';

/**
 * Selected tab of the Manage meetings dialog.
 */
const manageMeetingsDialog$ = createContext(
  () => ({
    selectedTab: 'archived' as ManageMeetingsTab,
  }),
  {
    actions: {
      selectTab(selectedTab: ManageMeetingsTab) {
        return ({ setState }) => {
          setState((state) => ({ ...state, selectedTab }));
        };
      },
    },
  }
);

export default manageMeetingsDialog$;
