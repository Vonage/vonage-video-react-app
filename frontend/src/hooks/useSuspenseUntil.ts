import React, { use } from 'react';
import useStableRef from './useStableRef';

type PromiseCreator<T> = () => Promise<T>;

/**
 * Suspends the component until resulting promise is resolved.
 * The promise get memoized with the provided dependencies.
 * @param {PromiseCreator<T>} callback - The promise creator function.
 * @param {React.DependencyList} dependencies - The dependencies for memoization.
 * @returns {T} - The resolved value of the promise.
 */
function useSuspenseUntil<T>(callback: PromiseCreator<T>, dependencies: React.DependencyList): T {
  const defer = useStableRef<Promise<T>>(() => callback(), [...dependencies]);

  return use(defer.current);
}

export default useSuspenseUntil;
