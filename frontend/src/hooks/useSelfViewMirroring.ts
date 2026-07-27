import { useEffect } from 'react';
import advancedSettings$ from '@Context/AdvancedSettings';

/**
 * Mirrors a local self-view video element according to the Camera mirroring setting, and updates it
 * live whenever the setting is toggled.
 *
 * The transform is applied to the video element itself rather than through a `child:` utility on its
 * container: these elements are appended imperatively and share their container with overlays such
 * as the name display and audio indicator, which must not be flipped.
 *
 * Mirroring is a local display concern only - remote participants are unaffected, and screen shares
 * are never mirrored.
 * @param {HTMLVideoElement | HTMLObjectElement | null | undefined} element - the self-view video element
 */
const useSelfViewMirroring = (
  element: HTMLVideoElement | HTMLObjectElement | null | undefined
): void => {
  const selfViewMirroringEnabled = advancedSettings$.use.select(
    (state) => state.selfViewMirroringEnabled
  );

  useEffect(() => {
    if (!element) return;

    // eslint-disable-next-line react-hooks/immutability
    element.style.transform = selfViewMirroringEnabled ? 'scaleX(-1)' : 'none';
  }, [element, selfViewMirroringEnabled]);
};

export default useSelfViewMirroring;
