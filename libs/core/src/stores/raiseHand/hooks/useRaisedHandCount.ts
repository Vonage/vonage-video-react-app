import raiseHand$ from '../raiseHand$';

/**
 * Returns the number of currently-raised hands in the session.
 *
 * Subscribes only to the raise-hand store, so this re-renders only when a
 * hand goes up or down — not on every other SessionContext change.
 */
const useRaisedHandCount = (): number => {
  const [{ handsMap }] = raiseHand$.use();
  return handsMap.size;
};

export default useRaisedHandCount;
