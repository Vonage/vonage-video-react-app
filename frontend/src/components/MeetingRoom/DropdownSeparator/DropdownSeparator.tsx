import { ReactElement } from 'react';
import Box from '@mui/material/Box';

/**
 * DropdownSeparator Component
 *
 * This component renders a horizontal separator line.
 * @returns {ReactElement} The DropdownSeparator component.
 */
const DropdownSeparator = (): ReactElement => {
  return (
    <Box
      data-testid="dropdown-separator"
      className="border-vera-border!"
      sx={{
        width: '100%',
        borderBottom: '1px solid',
      }}
    />
  );
};

export default DropdownSeparator;
