import { useMediaQuery as MUIUseMediaQuery } from '@mui/material';
import type { Theme } from '@mui/material/styles';

/**
 * Hook wrapper for MUI's useMediaQuery
 * @param {string | ((theme: Theme) => string)} query - Media query string or function that receives theme and returns query string
 * @param {object} [options] - Optional configuration for the media query
 * @param {boolean} [options.defaultMatches] - Default matches value during SSR
 * @param {(query: string) => MediaQueryList} [options.matchMedia] - Custom matchMedia implementation
 * @param {boolean} [options.noSsr] - If true, performs client-side only matching
 * @param {(query: string) => { matches: boolean }} [options.ssrMatchMedia] - Custom SSR matchMedia implementation
 * @returns {boolean} Whether the media query matches
 * @example
 * const isMobile = useMediaQuery('(max-width:600px)');
 * const isTablet = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
 */
const useMediaQuery = (
  query: string | ((theme: Theme) => string),
  options?: {
    defaultMatches?: boolean;
    matchMedia?: (query: string) => MediaQueryList;
    noSsr?: boolean;
    ssrMatchMedia?: (query: string) => { matches: boolean };
  }
): boolean => {
  return MUIUseMediaQuery(query, options);
};

export default useMediaQuery;
