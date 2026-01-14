/* eslint-disable react-hooks/rules-of-hooks */
import { use, useContext } from 'react';
import { suspenseContext, suspenseToken } from '../../components/SuspenseBoundary/SuspenseBoundary';
import isPromise from '../../assertions/isPromise';

/**
 * Context-aware wrapper for React's use function.
 * Ensures that the hook is used within a SuspenseBoundary Provider.
 * @param usable - A promise, context
 * @returns The usable resolved value.
 */
const use$ = <T>(...[usable]: Parameters<typeof use<T>>): T => {
  const token = useContext(suspenseContext);
  const isSafelyWrapped = token === suspenseToken;

  if (!isSafelyWrapped) {
    throw new Error('use$ must be used within a SuspenseBoundary Provider');
  }

  /**
   * Some of our implementations could call use with nonPromise/nonContext values.
   * This validation allow us to avoid suspending in those cases.
   */
  if (isPromise(usable) || isContext<T>(usable)) {
    return use<T>(usable);
  }

  return usable as T;
};

function isContext<T>(value: unknown): value is React.Context<T> {
  return Boolean(value && typeof value === 'object' && 'Provider' in value);
}

export default use$;
