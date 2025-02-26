import { useEffect, useState } from 'react';

/**
 * useWindowWidth
 *
 * Hook to find the current window width.
 * @returns {number} - How wide the current window is
 */
const useWindowWidth = () => {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
};

export default useWindowWidth;
