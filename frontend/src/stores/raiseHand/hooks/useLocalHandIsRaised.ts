import raiseHand$ from '../raiseHand$';
import useSessionContext from '../../../hooks/useSessionContext';

/**
 * Returns whether the local user's hand is currently raised.
 *
 * Reads the local connection ID from `useSessionContext` once and looks it up
 * in the global raise-hand store. Components using this hook re-render only
 * when the raise-hand state changes for the local user.
 */
const useLocalHandIsRaised = (): boolean => {
  const { getConnectionId } = useSessionContext();
  const [{ handsMap }] = raiseHand$.use();
  const localConnectionId = getConnectionId();
  if (!localConnectionId) return false;
  return handsMap.get(localConnectionId)?.raisedHand === true;
};

export default useLocalHandIsRaised;
