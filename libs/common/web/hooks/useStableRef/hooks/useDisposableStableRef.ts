import { useState, useEffectEvent, useEffect } from 'react';
import type { RefCreator, CleanupFunction } from '../useStableRef.types';

export const STABLE_REF_UNSAFE_RENDER_WARNING = [
  'useStableRef:',
  '',
  'Avoid creating values that require cleanup during render.',
  'React may run the render function multiple times and discard the result.',
  'Discarded renders do NOT run cleanup.',
  'This can lead to duplicated resources, memory leaks, or inconsistent state.',
  '',
  'Safe:',
  '- Do not create values that require cleanup during render.',
  '',
  'Advanced (unsafe, use at your own risk):',
  '- If you are 100% sure the value is pure (can be created multiple times and discarded without problems) and you need it during render, you can create the ref with an empty dependency array:',
  '  const ref = useStableRef(() => src, [])',
  '- and dispose it manually in an effect:',
  '  useEffect(() => () => ref.current.dispose(), [])',
  '- WARNING:',
  '  React does not guarantee cleanup will run for discarded renders, so you may end up with duplicated resources or memory leaks.',
].join('\n');

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
  const [ref] = useState(() => {
    let current = undefined as T;

    const wrapper = {
      current,
      isInitialized: false,
    };

    Object.defineProperties(wrapper, {
      current: {
        get: () => {
          if (!wrapper.isInitialized) {
            throw new Error(STABLE_REF_UNSAFE_RENDER_WARNING);
          }

          return current;
        },
        set: (value: T) => {
          current = value;
        },
      },
    });

    return wrapper;
  });

  const stableBuilder = useEffectEvent(() => {
    const current = builder();

    ref.current = current;
    ref.isInitialized = true;

    return () => {
      cleanup?.(current);
    };
  });

  useEffect(() => {
    return stableBuilder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return ref as React.RefObject<T>;
}

export default useDisposableStableRef;
