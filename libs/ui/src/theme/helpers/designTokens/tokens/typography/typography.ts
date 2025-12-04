/**
 * Typography Tokens
 *
 * This module aggregates typography-related design tokens, including
 * typefaces, type scales, and font weights. These tokens ensure
 * consistent typographic styles across the user interface.
 */
import { ThemeTokens } from '@ui/theme';
import typeface from './typeface';
import typeScale from './typescale';
import weight from './weight';

const typography: ThemeTokens['typography'] = {
  typeface,
  typeScale,
  weight,
};

export default typography;
