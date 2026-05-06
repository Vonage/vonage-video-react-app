import createContext from 'react-global-state-hooks/createContext';

/**
 * Entry stored in the raise-hand map.
 *
 * The store invariant is: a participant is in the map iff their hand is up.
 * `removeHand` deletes the entry on lower; the type narrows `raisedHand` to
 * `true` so callers don't need a defensive `=== true` check.
 */
export type RaisedHandEntry = {
  /** Connection ID of the participant (also the map key). */
  connectionId: string;
  /** Display name, used by the queue UI. */
  participantName: string;
  /** Always `true` while in the map — encodes the store invariant. */
  raisedHand: true;
  /** Epoch ms when the hand was raised. Drives the queue order. */
  raisedHandTimestamp: number;
};

/**
 * Global store for raised-hand state.
 *
 * Lives outside `SessionContext` so a raise/lower only re-renders components
 * that read from this store, instead of every SessionContext consumer
 * (toolbar, all video tiles, participants list, …).
 */
type RaiseHandStore = {
  /** Map of connectionId → entry. Only contains currently-raised hands. */
  handsMap: Map<string, RaisedHandEntry>;
};

const initialState: RaiseHandStore = { handsMap: new Map() };

const raiseHand$ = createContext(initialState, {
  name: 'raiseHand',
  actions: {
    /** Add or update a raised-hand entry. */
    setHand(connectionId: string, hand: RaisedHandEntry) {
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
        setState({ handsMap: new Map() });
      };
    },
    /** Replace the entire map atomically. Used by reconnect to preserve own queue position. */
    replaceAll(map: Map<string, RaisedHandEntry>) {
      return ({ setState }) => {
        setState({ handsMap: map });
      };
    },
  },
});

export default raiseHand$;
