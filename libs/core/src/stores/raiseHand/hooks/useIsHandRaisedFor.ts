import raiseHand$ from '../raiseHand$';

/**
 * Returns whether the participant identified by `connectionId` currently has
 * their hand raised. Used by per-tile badges (Subscriber).
 */
const useIsHandRaisedFor = (connectionId: string | undefined): boolean => {
  const [{ handsMap }] = raiseHand$.use();
  if (!connectionId) return false;
  // The store only ever holds raised hands (removeHand deletes the entry),
  // so presence in the map is equivalent to "currently raised".
  return handsMap.has(connectionId);
};

export default useIsHandRaisedFor;
