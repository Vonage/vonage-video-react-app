import { useMemo } from 'react';
import raiseHand$ from '../raiseHand$';
import type { RaiseHandState } from '../../../types/session';

/**
 * Subscribes to the global raise-hand store and returns the queue of currently
 * raised hands sorted oldest-first. Re-renders only when the underlying map
 * changes (not on unrelated session updates).
 */
const useRaisedHands = (): RaiseHandState[] => {
  const [{ handsMap }] = raiseHand$.use();
  return useMemo<RaiseHandState[]>(() => {
    const raised = [...handsMap.values()].filter((s) => s.raisedHand);
    raised.sort((a, b) => (a.raisedHandTimestamp ?? 0) - (b.raisedHandTimestamp ?? 0));
    return raised;
  }, [handsMap]);
};

export default useRaisedHands;
