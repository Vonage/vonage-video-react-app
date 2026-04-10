import createContext from 'react-global-state-hooks/createContext';

/**
 * AdvancedSettingsDialog Context
 * Manages the state of the Advanced Settings Dialog.
 */
const advancedSettingsDialog$ = createContext(
  {
    isOpen: false,
  },
  {
    actions: {
      open() {
        return ({ setState }) => {
          setState((state) => ({ ...state, isOpen: true }));
        };
      },
      close() {
        return ({ setState }) => {
          setState((state) => ({ ...state, isOpen: false }));
        };
      },
    },
  }
);

export default advancedSettingsDialog$;
