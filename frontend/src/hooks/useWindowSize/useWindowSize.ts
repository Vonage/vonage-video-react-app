import { useEffect, useState } from 'react';

export type WindowSize = {
  width: number;
  height: number;
};

const readWindowSize = (): WindowSize => ({
  width: typeof window === 'undefined' ? 0 : window.innerWidth,
  height: typeof window === 'undefined' ? 0 : window.innerHeight,
});

/**
 * React hook returning the current window width and height. Updates on any
 * resize event — unlike width-only hooks, this also reflects mobile browser
 * UI changes (e.g. address-bar collapse/expand) that alter `innerHeight`
 * without changing `innerWidth`.
 */
const useWindowSize = (): WindowSize => {
  const [size, setSize] = useState<WindowSize>(readWindowSize);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleResize = () => setSize(readWindowSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
};

export default useWindowSize;
