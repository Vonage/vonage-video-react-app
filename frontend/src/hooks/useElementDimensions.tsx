import { Dimensions } from '@vonage/client-sdk-video';
import { throttle } from 'lodash';
import ResizeObserverPolyfill from 'resize-observer-polyfill';
import { RefObject, useEffect, useRef, useState } from 'react';

export type UseElementDimensionsProps = {
  elementRef: RefObject<HTMLElement | null>;
};
/**
 * Util hook to observe element resize changes and get element dimensions as react state.
 * State changes are throttled for performance
 * @param {UseElementDimensionsProps} props - the props for this hook
 *  @property {RefObject<HTMLElement | null>} elementRef - HTMLElement ref object
 * @returns {Dimensions} - element dimensions
 */
const useElementDimensions = ({ elementRef }: UseElementDimensionsProps): Dimensions => {
  const [elementDimensions, setElementDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  const resizeObserver = useRef<ResizeObserver | undefined>(undefined);

  useEffect(() => {
    const elementCurrent = elementRef.current;
    if (elementCurrent && !resizeObserver.current) {
      const throttledSetDimensions = throttle(() => {
        setElementDimensions({
          height: elementCurrent.offsetHeight,
          width: elementCurrent.offsetWidth,
        });
      }, 20);
      resizeObserver.current = new ResizeObserverPolyfill(() => {
        throttledSetDimensions();
      });
      resizeObserver.current?.observe(elementCurrent);
    }
    return () => {
      if (elementCurrent) {
        resizeObserver.current?.unobserve(elementCurrent);
      }
    };
  }, [elementRef]);
  return elementDimensions;
};

export default useElementDimensions;
