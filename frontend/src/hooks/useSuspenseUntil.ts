import React from 'react';
import { use$ } from '@Context/Suspense$';
import useStableRef from './useStableRef';

type Builder<T> = () => Promise<T> | T;

/**
 * Suspends the component until certain source is ready.
 * @param callback - A function that returns a promise or a value.
 * - If a promise is returned, the component will suspend until the promise resolves.
 * - If nonContext or Promise is returned, the returned value is used directly.
 * @param dependencies - Dependencies to calculate if during the next render the source should be re-evaluated.
 * @returns The resolved value from the callback.
 */
function useSuspenseUntil<T>(callback: Builder<T>, dependencies: React.DependencyList): T {
  const usable = useStableRef<Promise<T> | T>(() => callback(), dependencies).current;

  return use$(usable as Promise<T>);
}

export default useSuspenseUntil;
