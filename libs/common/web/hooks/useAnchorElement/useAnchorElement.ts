import { isFunction } from '../../assertions';
import useMountEffect from '../useMountEffect';

type UseAnchorElementProps = {
  /**
   * A ref to the element that will be used as an anchor for the iframe. The iframe will be positioned and sized to match this element.
   */
  anchorRef: React.RefObject<HTMLElement | null>;

  /**
   * A function that return the element to anchor to.
   */
  target: HTMLElement | null | (() => HTMLElement | null);

  /**
   * Optional callback that will be called when the anchor element is captured by the anchor.
   */
  onAttach?: () => void;

  /**
   * Optional callback that will be called when the anchor element is released by the anchor. On unmount.
   */
  onDetach?: () => void;
};

/**
 * Anchors an element to the position and size of another element.
 */
const useAnchorElement = ({ anchorRef, target, onAttach, onDetach }: UseAnchorElementProps) => {
  useMountEffect(() => {
    const selector = isFunction(target) ? target : () => target;

    const elementToAnchor = selector();
    const anchorTo = anchorRef.current;

    if (!elementToAnchor || !anchorTo) return;

    onAttach?.();

    let frameId: number;

    const update = () => {
      const rect = anchorTo.getBoundingClientRect();

      Object.assign(elementToAnchor.style, {
        position: 'fixed',
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        zIndex: '10',
      });

      frameId = requestAnimationFrame(update);
    };

    update();

    return () => {
      onDetach?.();
      cancelAnimationFrame(frameId);
    };
  });
};

export default useAnchorElement;
