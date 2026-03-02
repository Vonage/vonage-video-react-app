import { suspenseContext, suspenseToken } from '../../components/SuspenseBoundary';
import { useContext } from 'react';

/**
 * Asserts that the hook is used within a SuspenseBoundary Provider.
 * @param message - The error message to throw if the assertion fails.
 */
const useAssertSuspense = (message: string) => {
  const token = useContext(suspenseContext);
  const isSafelyWrapped = token === suspenseToken;

  if (!isSafelyWrapped) {
    throw new Error(message);
  }
};

export default useAssertSuspense;
