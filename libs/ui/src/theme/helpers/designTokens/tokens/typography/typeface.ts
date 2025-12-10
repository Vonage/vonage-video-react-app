import { ThemeTokens } from '@ui/theme';

/**
 * Typeface Design Tokens
 *
 * This module defines the primary typeface used across the user interface.
 * It specifies the font family along with a description of its intended use.
 */
const typeface: ThemeTokens['typography']['typeface'] = {
  plain: {
    value: 'Inter, sans-serif, system-ui, ui-sans-serif, Marker Felt, Trebuchet MS',
    type: 'fontFamily',
    description: 'Primary typeface for all text elements in the user interface.',
  },
};

export default typeface;
