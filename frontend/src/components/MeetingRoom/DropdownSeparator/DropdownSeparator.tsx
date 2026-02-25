import { ReactElement } from 'react';
import Box from '@mui/material/Box';
import useTheme from '@ui/theme';

/**
 * DropdownSeparator Component
 *
 * This component renders a horizontal separator line.
 * @returns {ReactElement} The DropdownSeparator component.
 */
const DropdownSeparator = (): ReactElement => {
  const theme = useTheme();

  return (
    <Box
      data-testid="dropdown-separator"
      sx={{
        width: '100%',
        borderBottom: '1px solid',
        borderColor: theme.colors.border,
      }}
    />
  );
};

export default DropdownSeparator;
