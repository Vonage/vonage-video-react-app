import Box from '@ui/Box';
import { ReactElement } from 'react';
import useCustomTheme from '@Context/Theme';

export type SeparatorProps = {
  orientation?: 'left' | 'right';
};

/**
 * Separator Component
 *
 * This component renders a horizontal line with customizable orientation that is set to left by default.
 * @param {SeparatorProps} props - the props for the component.
 *  @property {'left' | 'right'} orientation - whether the separator is oriented to the left or right
 * @returns {ReactElement} The separator component.
 */
const Separator = ({ orientation = 'left' }: SeparatorProps): ReactElement => {
  const theme = useCustomTheme();
  return (
    <Box
      data-testid="separator"
      sx={{
        width: '50%',
        borderBottom: '1px solid',
        borderColor: theme.colors.border,
        ...(orientation === 'left' ? { marginRight: 1 } : { marginLeft: 1 }),
      }}
    />
  );
};

export default Separator;
