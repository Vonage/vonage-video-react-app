import { useCallback, useEffect, useState } from 'react';

const useShownButtons = () => {
  // Minimum width: 354 = 107 + 107 + (48 + 12) + 48 + 32
  const getNumberOfButtons = useCallback((width: number) => {
    switch (true) {
      case width >= 786:
        return 7;

      case width >= 726:
        return 6;

      case width >= 654:
        return 5;

      case width >= 594:
        return 4;

      case width >= 534:
        return 3;

      case width >= 474:
        return 2;

      case width >= 414:
        return 1;

      default:
        return 0;
    }
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
