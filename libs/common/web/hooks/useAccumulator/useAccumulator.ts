import useStableRef from '../useStableRef';
import React, { useRef } from 'react';

type RefCreator<T> = (previousValue: T | undefined) => T;

function useAccumulator<T>(
  callback: RefCreator<T>,
  deps: React.DependencyList
): React.RefObject<T> {
  const previousRef = useRef<T | undefined>(undefined);

  const ref = useStableRef(() => callback(previousRef.current), deps);

  previousRef.current = ref.current;

  return ref;
}

export default useAccumulator;
