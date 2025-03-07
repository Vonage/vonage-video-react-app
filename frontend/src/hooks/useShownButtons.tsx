import { useCallback, useEffect, useState } from 'react';

/**
 * React hook to determine the number of buttons to be shown on the toolbar.
 * @returns {number} - The number of buttons to be shown on the toolbar.
 */
const useShownButtons = (): number => {
  const getNumberOfButtons = useCallback((width: number): number => {
    // Minimum width: 354 = 107 audio selector + 107 video selector + (48 + 12) overflow menu + 48 exit button + 32px padding
    const widthForEssentialButtons = 107 + 107 + (48 + 12) + 48 + 32;
    const widthForExtraButtons = width - widthForEssentialButtons;
    // Each additional button: 60px = 48px button width + 12px margin
    const extraButtons = widthForExtraButtons / 60;
    if (extraButtons > 4) {
      // We account for 12px of margin used for the right sidebar buttons' container.
      return Math.floor((widthForExtraButtons - 12) / 60);
    }
    return Math.floor(extraButtons);
  }, []);

  const [shownButtons, setShownButtons] = useState(getNumberOfButtons(window.innerWidth));

  useEffect(() => {
    const handleResize = () => {
      const maxShownButtons = getNumberOfButtons(window.innerWidth);
      setShownButtons(maxShownButtons);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  return shownButtons;
};

export default useShownButtons;
