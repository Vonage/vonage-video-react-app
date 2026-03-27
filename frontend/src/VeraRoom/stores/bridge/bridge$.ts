import { createContext, type InferAPI } from 'react-global-state-hooks';
import { initialState, metadata } from './constants';

export type BridgeAPI = InferAPI<typeof bridge$>;

type BridgeState = ReturnType<typeof initialState>;

/**
 * This store contains the state and actions related to the bridge between the VeraRoom web component and the React application.
 */
const bridge$ = createContext(initialState, {
  name: 'bridge',
  metadata,
  actions: {
    /**
     * Merges the provided attribute values into the bridge state.
     */
    partialUpdate(attributes: Partial<BridgeState>) {
      return ({ setState }) => {
        setState((state) => ({ ...state, ...attributes }));
      };
    },
  },
});

export default bridge$;
