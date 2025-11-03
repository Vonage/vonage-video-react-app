import { useMediaQuery } from '@mui/material';
import { TABLET_VIEWPORT } from '../utils/constants';

/**
 * useIsTabletViewport Hook
 *
 * A custom hook that checks if the viewport width is less than or equal to a defined tablet viewport width.
 * @returns {boolean} True if the viewport is tablet-sized, false otherwise.
 */
const useIsTabletViewport = (): boolean => {
  return useMediaQuery(`(max-width:${TABLET_VIEWPORT}px)`);
};

export default useIsTabletViewport;
