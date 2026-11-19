import { useRef } from 'react';
import useMountEffect from '../useMountEffect';

/**
 * A hook that provides a ref indicating whether the component has unmounted.
 */
function useDidUnmountRef() {
  const didUnmountRef = useRef(false);

  useMountEffect(() => {
    return () => {
      didUnmountRef.current = true;
    };
  });

  return didUnmountRef;
}

export default useDidUnmountRef;
