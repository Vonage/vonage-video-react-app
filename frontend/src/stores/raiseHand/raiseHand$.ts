import createContext from 'react-global-state-hooks/createContext';
import type { RaiseHandState } from '../../types/session';

/**
 * Global store for raised-hand state.
 *
 * Lives outside `SessionContext` so a raise/lower only re-renders components
 * that read from this store, instead of every SessionContext consumer
 * (toolbar, all video tiles, participants list, …).
 */
type RaiseHandStore = {
  /** Map of connectionId → RaiseHandState. Only contains currently-raised hands. */
  handsMap: Map<string, RaiseHandState>;
};

const initialState: RaiseHandStore = { handsMap: new Map() };

const raiseHand$ = createContext(initialState, {
  name: 'raiseHand',
  actions: {
    /** Add or update a raised-hand entry. */
    setHand(connectionId: string, hand: RaiseHandState) {
      return ({ setState }) => {
        setState((state) => {
          const next = new Map(state.handsMap);
          next.set(connectionId, hand);
          return { ...state, handsMap: next };
        });
      };
    },
    /** Remove a hand (lower it / participant disconnected). No-op if absent. */
    removeHand(connectionId: string) {
      return ({ setState }) => {
        setState((state) => {
          if (!state.handsMap.has(connectionId)) return state;
          const next = new Map(state.handsMap);
          next.delete(connectionId);
          return { ...state, handsMap: next };
        });
      };
    },
    /** Clear all hands. */
    clear() {
      return ({ setState }) => {
        setState((state) => ({ ...state, handsMap: new Map() }));
      };
    },
    /** Replace the entire map atomically. Used by reconnect to preserve own queue position. */
    replaceAll(map: Map<string, RaiseHandState>) {
      return ({ setState }) => {
        setState((state) => ({ ...state, handsMap: map }));
      };
    },
  },
});

export default raiseHand$;
