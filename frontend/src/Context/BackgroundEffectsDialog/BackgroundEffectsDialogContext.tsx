import createContext from 'react-global-state-hooks/createContext';

/**
 * BackgroundEffectsDialog Context
 * Manages the state of the Background Effects Dialog.
 */
const backgroundEffectsDialog$ = createContext(
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

export default backgroundEffectsDialog$;
