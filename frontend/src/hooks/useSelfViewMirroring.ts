import { useEffect } from 'react';
import advancedSettings$ from '@Context/AdvancedSettings';

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
