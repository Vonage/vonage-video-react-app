import createContext from 'react-global-state-hooks/createContext';

/**
 * PrecallNetworkTestDialog Context
 * Manages the state of the Precall Network Test Dialog.
 */
const precallNetworkTestDialog$ = createContext(
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

export default precallNetworkTestDialog$;
