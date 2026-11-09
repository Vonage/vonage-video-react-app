import { type RefObject, useLayoutEffect } from 'react';
import type { MiniModeHostedElement } from '../../../Context/MiniMode/helpers/resolveMiniModeParticipant';

/**
 * Moves a video element into the host while mounted and puts it back where it came from afterwards.
 * It is also put back on `pagehide`, while the Picture-in-Picture document is still alive.
 * @param {RefObject<HTMLDivElement | null>} hostRef - The container inside the Mini Mode window
 * @param {MiniModeHostedElement} element - The video element to show, or null for none
 */
const useHostedVideoElement = (
  hostRef: RefObject<HTMLDivElement | null>,
  element: MiniModeHostedElement
): void => {
  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host || !element) return undefined;

    const originalParent = element.parentElement;
    const pictureInPictureWindow = host.ownerDocument.defaultView;
    const restore = () => {
      if (host.contains(element)) originalParent?.appendChild(element);
    };

    host.appendChild(element);
    // eslint-disable-next-line react-hooks/immutability -- the SDK owns this element, not React
    element.style.objectFit = 'cover';
    pictureInPictureWindow?.addEventListener('pagehide', restore);

    return () => {
      pictureInPictureWindow?.removeEventListener('pagehide', restore);
      restore();
    };
  }, [hostRef, element]);
};

export default useHostedVideoElement;
