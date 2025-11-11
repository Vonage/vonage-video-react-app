/**
 * Typeface Design Tokens
 *
 * This module defines the primary typeface used across the user interface.
 * It specifies the font family along with a description of its intended use.
 */
const typeface = {
  plain: {
    value: 'Inter, sans-serif, system-ui, ui-sans-serif, Marker Felt, Trebuchet MS',
    type: 'fontFamily',
    description: 'Primary typeface for all text elements in the user interface.',
  },
};

export type Typeface = keyof typeof typeface;

export type TypefaceProps = {
  value: string;
  type: 'fontFamily';
  description: string;
};

export default typeface as Record<Typeface, TypefaceProps>;
