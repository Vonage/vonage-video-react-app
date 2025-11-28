import useStableRef from '@hooks/useStableRef';
import { useCallback } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

/**
 * @description Hook to create a stable callback function.
 * The returned callback function reference will be stable across renders.
 * The internal implementation will always call the latest version of the provided callback.
 * @param callback The callback function to stabilize
 * @returns A stable version of the callback function
 */
const useStableCallback = <T extends AnyFunction>(callback: T): T => {
  const ref = useStableRef(callback);

  return useCallback(
    (...args: unknown[]) => {
      return ref.current(...args) as T;
    },
    [ref]
  ) as T;
};

export default useStableCallback;
