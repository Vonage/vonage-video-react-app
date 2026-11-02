import { ReactElement } from 'react';
import Box from '@mui/material/Box';

export const testIds = {
  separator: 'dropdown-separator',
} as const;

/**
 * DropdownSeparator Component
 *
 * This component renders a horizontal separator line.
 * @returns {ReactElement} The DropdownSeparator component.
 */
const DropdownSeparator = (): ReactElement => {
  return (
    <Box
      data-testid={testIds.separator}
      className="w-full border-b border-solid border-vera-border!"
    />
  );
};

export default DropdownSeparator;
