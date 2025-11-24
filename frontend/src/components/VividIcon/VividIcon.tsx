import { SxProps } from '@ui/SxProps';
import React from 'react';

interface VividIconProps extends Record<string, unknown> {
  name: string;
  customSize: -6 | -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5;
  sx?: SxProps;
}

/**
 * VividIcon Component
 * A component that displays a Vivid icon with customizable size.
 * @param {VividIconProps} props - The props for the component.
 * @property {string} name - The name of the icon to display.
 * @property {number} customSize - The size of the icon, ranging from -6 to 5. -6 is the smallest and 5 is the largest.
 * @property {object} sx - Optional sx prop for styling. Note: Only basic CSS properties are supported (color, fontSize, margin, padding, etc.). Media queries and complex MUI-specific syntax are not supported.
 * @returns {React.ReactElement} The rendered VividIcon component.
 */
const VividIcon: React.FC<VividIconProps> = ({ name, customSize, sx, ...props }) => {
  // Convert sx prop to inline styles
  // Note: This is a simplified implementation that doesn't support media queries or complex MUI syntax
  const style =
    sx && typeof sx === 'object' && !Array.isArray(sx)
      ? Object.entries(sx).reduce(
          (acc, [key, value]) => {
            // Skip undefined values and non-string/number values
            if (value === undefined || (typeof value !== 'string' && typeof value !== 'number')) {
              return acc;
            }
            // Convert camelCase to kebab-case for CSS properties
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            acc[cssKey] = value;
            return acc;
          },
          {} as Record<string, string | number>
        )
      : undefined;

  return (
    // @ts-expect-error custom element
    <vwc-icon
      size={customSize}
      name={name}
      data-testid={`vivid-icon-${name}`}
      style={style}
      {...props}
    />
  );
};

export default VividIcon;
