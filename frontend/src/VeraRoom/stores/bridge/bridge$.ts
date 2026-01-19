import { createContext, type InferAPI } from 'react-global-state-hooks';
import { initialState, metadata } from './constants';

export type BridgeAPI = InferAPI<typeof bridge$>;

/**
 * This store contains the state and actions related to the bridge between the VeraRoom web component and the React application.
 */
const bridge$ = createContext(initialState, {
  name: 'bridge',
  metadata,
});

export default bridge$;
