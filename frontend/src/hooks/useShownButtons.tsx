import { useEffect, useState } from 'react';

const useShownButtons = () => {
  const buttonWidth = 48;
  const minimumSupportedViewport = 360;
  const rightPanelMargin = 12;

  const [shownButtons, setShownButtons] = useState(
    Math.floor((window.innerWidth - (minimumSupportedViewport + rightPanelMargin)) / buttonWidth)
  );

  useEffect(() => {
    const handleResize = () => {
      const maxShownButtons = Math.floor(
        (window.innerWidth - (minimumSupportedViewport + rightPanelMargin)) / buttonWidth
      );
      setShownButtons(maxShownButtons);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  return shownButtons;
};

export default useShownButtons;
