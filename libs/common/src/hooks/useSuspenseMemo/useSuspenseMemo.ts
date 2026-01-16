import React from 'react';
import use$ from '../use$';
import useStableRef from '../useStableRef';

type Builder<T> = () => Promise<T> | T;

/**
 * Like useMemo, but supports async values through Suspense.
 *
 * The callback runs once per dependency change. If it returns a Promise,
 * the component will suspend until it resolves. If it returns a normal
 * value, that value is used immediately without suspending.
 *
 * @param callback - A function that returns either a value or a Promise.
 * @param dependencies - Re-run the callback when these change. If the new
 *                      result is a Promise, rendering will suspend.
 * @returns The callback's returned value (or the resolved value if async).
 */
function useSuspenseMemo<T>(callback: Builder<T>, dependencies: React.DependencyList): T {
  const usable = useStableRef<Promise<T> | T>(() => callback(), dependencies).current;

  return use$(usable as Promise<T>);
}

export default useSuspenseMemo;
