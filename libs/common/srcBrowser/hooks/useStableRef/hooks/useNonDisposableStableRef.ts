import { useState } from 'react';
import type { RefCreator } from '../useStableRef.types';
import { stable_ref_unique_symbol } from '../useStableRef.types';
import shallowCompare from 'react-global-state-hooks/shallowCompare';
import { isFunction } from '@common/assertions';

/**
 * Non-disposable stable ref. State created during render phase cannot be disposed.
 * React strict mode will invoke render twice in dev mode, so the builder must be pure.
 */
function useNonDisposableStableRef<T>(
  builder: RefCreator<T>,
  dependencies: React.DependencyList
): React.RefObject<T> {
  const [ref] = useState(() => ({
    current: undefined as T | undefined,
    dependencies: undefined as React.DependencyList | undefined,
  }));

  const isFirstRun = ref.current === stable_ref_unique_symbol;

  const shouldBuild =
    isFunction(builder) && (isFirstRun || !shallowCompare(ref.dependencies, dependencies));

  // eslint-disable-next-line react-hooks/immutability
  if (shouldBuild) ref.current = builder();

  // eslint-disable-next-line react-hooks/immutability
  ref.dependencies = dependencies;

  return ref as React.RefObject<T>;
}

export default useNonDisposableStableRef;
