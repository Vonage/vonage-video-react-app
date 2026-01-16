import { useMemo, useEffectEvent, useEffect } from 'react';
import type { RefCreator, CleanupFunction } from '../useStableRef.types';
import { stable_ref_unique_symbol } from '../useStableRef.types';

/**
 * Disposable stable ref, not available during render phase.
 */
function useDisposableStableRef<T>({
  builder,
  cleanup,
  dependencies,
}: {
  builder: RefCreator<T>;
  cleanup: CleanupFunction<T>;
  dependencies: React.DependencyList;
}): React.RefObject<T> {
  const ref = useMemo(() => {
    let current = stable_ref_unique_symbol as T | typeof stable_ref_unique_symbol;

    const wrapper = {
      current,
      isInitialized: false,
    };

    Object.defineProperties(wrapper, {
      current: {
        get: () => {
          if (!wrapper.isInitialized) {
            throw new Error('Stable ref is not available during render phase.');
          }

          return current;
        },
        set: (value: T) => {
          current = value;
        },
      },
    });

    return wrapper;
  }, []);

  const stableBuilder = useEffectEvent(builder);
  const stableCleanup = useEffectEvent(cleanup);

  useEffect(() => {
    const current = stableBuilder();

    ref.current = current;
    ref.isInitialized = true;

    return () => {
      stableCleanup?.(current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, ...dependencies]);

  return ref as React.RefObject<T>;
}

export default useDisposableStableRef;
