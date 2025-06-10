import { useMediaQuery } from '@mui/material';
import { SMALL_VIEWPORT } from '../utils/constants';

/**
 * useIsSmallViewport Hook
 *
 * A custom hook that checks if the viewport width is less than or equal to a defined small viewport width.
 * @returns {boolean} True if the viewport is small, false otherwise.
 */
export default function useIsSmallViewport(): boolean {
  return useMediaQuery(`(max-width:${SMALL_VIEWPORT}px)`);
}
