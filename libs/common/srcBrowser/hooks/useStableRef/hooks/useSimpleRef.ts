import { useRef } from 'react';

/**
 * Simple stable ref hook that always updates the ref's current value.
 */
function useSimpleRef<T>(value: T): React.RefObject<T> {
  const ref = useRef<T>(value);
  ref.current = value;

  return ref;
}

export default useSimpleRef;
