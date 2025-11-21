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
 * @property {object} sx - Optional sx prop for styling.
 * @returns {React.ReactElement} The rendered VividIcon component.
 */
const VividIcon: React.FC<VividIconProps> = ({ name, customSize, sx, ...props }) => {
  const style =
    sx && typeof sx === 'object' && !Array.isArray(sx) && 'color' in sx
      ? { color: sx.color as string }
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
