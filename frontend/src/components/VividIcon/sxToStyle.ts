import type { SxProps } from '@mui/material';

/**
 * Converts a simplified sx prop object to inline CSS styles.
 *
 * - Supports only basic CSS property/value pairs (string or number values)
 * - Converts only camelCase property names to kebab-case
 * - Filters out undefined values and non-primitive values
 * @param {SxProps | undefined} sx - The sx prop object to convert.
 * @returns {Record<string, string | number> | undefined} The converted style object or undefined.
 */
const sxToStyle = (sx: SxProps | undefined): Record<string, string | number> | undefined => {
  if (!sx || typeof sx !== 'object' || Array.isArray(sx)) {
    return undefined;
  }

  return Object.entries(sx).reduce(
    (acc, [key, value]) => {
      // Skip undefined values and non-string/number values
      if (value === undefined || (typeof value !== 'string' && typeof value !== 'number')) {
        return acc;
      }

      // Convert camelCase to kebab-case for CSS properties
      const cssKey = key.replaceAll(/([A-Z])/g, '-$1').toLowerCase();
      acc[cssKey] = value;
      return acc;
    },
    {} as Record<string, string | number>
  );
};

export default sxToStyle;
