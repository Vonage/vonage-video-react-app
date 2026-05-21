import { createContext, type InferAPI } from 'react-global-state-hooks';

export type CollapsibleState = typeof initialState;

export type CollapsibleAPI = InferAPI<typeof collapsible$>;

const initialState = {
  open: false,
};

const collapsible$ = createContext(initialState, {
  actions: {
    /**
     * Toggles the open state of the collapsible. If `args.open` is provided, it will set the open state to that value instead of toggling.
     */
    toggle(args?: { open: boolean }) {
      return ({ setState, getState }) => {
        const { open } = getState();
        setState((state) => ({ ...state, open: args?.open ?? !open }));
      };
    },
  },
});

export default collapsible$;
