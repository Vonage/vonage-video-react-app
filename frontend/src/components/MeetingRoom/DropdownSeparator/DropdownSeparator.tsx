import { ReactElement } from 'react';

/**
 * DropdownSeparator Component
 *
 * This component renders a horizontal separator line.
 * @returns {ReactElement} The DropdownSeparator component.
 */
const DropdownSeparator = (): ReactElement => {
  return (
    <div
      className="w-full border-b border-solid"
      style={{ borderColor: 'rgba(232, 234, 237, 0.25)' }}
    />
  );
};

export default DropdownSeparator;
