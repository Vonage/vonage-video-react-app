import { useMemo } from 'react';
import raiseHand$, { type RaisedHandEntry } from '../raiseHand$';

/**
 * Subscribes to the global raise-hand store and returns the queue of currently
 * raised hands sorted oldest-first. Re-renders only when the underlying map
 * changes (not on unrelated session updates).
 */
const useRaisedHands = (): RaisedHandEntry[] => {
  const [{ handsMap }] = raiseHand$.use();
  return useMemo<RaisedHandEntry[]>(
    () => [...handsMap.values()].sort((a, b) => a.raisedHandTimestamp - b.raisedHandTimestamp),
    [handsMap]
  );
};

export default useRaisedHands;
