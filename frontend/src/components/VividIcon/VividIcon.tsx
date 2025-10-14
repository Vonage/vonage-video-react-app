import React from 'react';

interface VividIconProps {
  name: string;
  customSize: -6 | -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * VividIcon Component
 * A component that displays a Vivid icon with customizable size.
 * @param {VividIconProps} props - The props for the component.
 * @property {string} name - The name of the icon to display.
 * @property {number} customSize - The size of the icon, ranging from -6 to 6. -6 is the smallest and 6 is the largest.
 * @returns {React.ReactElement} The rendered VividIcon component.
 */
const VividIcon: React.FC<VividIconProps> = ({ name, customSize }) => {
  // @ts-expect-error custom element
  return <vwc-icon size={customSize} name={name} data-testid={`vivid-icon-${name}`} />;
};

export default VividIcon;
