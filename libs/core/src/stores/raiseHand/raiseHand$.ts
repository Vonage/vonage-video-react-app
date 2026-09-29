import { createGlobalState, type InferAPI } from 'react-global-state-hooks';
import type { Prettify } from '@common/types';

export type RaisedHand = {
  connectionId: string;
  raisedAt: number;
};

type RaiseHandState = {
  raisedHands: Record<string, RaisedHand>;
};

export type RaiseHandAPI = InferAPI<typeof raiseHandStore>;

/**
 * Raise Hand Store
 * Tracks which participants have raised their hand in a session.
 * Uses createGlobalState (singleton) — matching the mediaDevices$ pattern —
 * so actions are available as a direct property (`raiseHand$.actions.*`)
 * and no Provider wrapper is needed.
 */
const raiseHandStore = createGlobalState({ raisedHands: {} } as RaiseHandState, {
  name: 'raiseHand',
  actions: {
    raiseHand({
      connectionId,
      raisedAt = Date.now(),
    }: {
      connectionId: string;
      raisedAt?: number;
    }) {
      return ({ setState }) => {
        setState((state) => ({
          ...state,
          raisedHands: {
            ...state.raisedHands,
            [connectionId]: { connectionId, raisedAt },
          },
        }));
      };
    },

    lowerHand({ connectionId }: { connectionId: string }) {
      return ({ setState }) => {
        setState((state) => {
          const next = { ...state.raisedHands };
          delete next[connectionId];
          return { ...state, raisedHands: next };
        });
      };
    },

    lowerAllHands() {
      return ({ setState }) => {
        setState({ raisedHands: {} });
      };
    },
  },
});

/**
 * Hook to get all raised hands sorted chronologically (oldest first).
 */
const useRaisedHands = () => {
  return raiseHandStore.use.select(({ raisedHands }) => {
    return Object.values(raisedHands).sort((first, second) => first.raisedAt - second.raisedAt);
  });
};

/**
 * Hook to get the count of currently raised hands.
 */
const useRaisedHandCount = () => {
  return raiseHandStore.use.select(({ raisedHands }) => {
    return Object.keys(raisedHands).length;
  });
};

/**
 * Hook to get a participant's 1-based position in the raised-hand queue
 * (ordered by when the hand was raised). Returns 0 when the hand is not raised.
 */
const useRaisedHandPosition = (connectionId: string) => {
  return raiseHandStore.use.select(({ raisedHands }) => {
    const raisedHand = raisedHands[connectionId];
    if (!raisedHand) return 0;

    const handsRaisedBefore = Object.values(raisedHands).filter(
      (hand) => hand.raisedAt < raisedHand.raisedAt
    );

    return handsRaisedBefore.length + 1;
  });
};

/**
 * Hook to check if a participant's hand is raised.
 */
const useIsHandRaised = (connectionId: string) => {
  return raiseHandStore.use.select(({ raisedHands }) => {
    return !!raisedHands[connectionId];
  });
};

const extensions = {
  useRaisedHands,
  useRaisedHandCount,
  useIsHandRaised,
  useRaisedHandPosition,
};

const raiseHand$ = Object.assign(raiseHandStore, extensions) as Prettify<
  Omit<
    typeof raiseHandStore,
    // We are removing these properties to make the public namespace smaller and easier to digest
    'select' | 'dispose' | 'subscribers'
  > &
    typeof extensions
>;

export default raiseHand$;
