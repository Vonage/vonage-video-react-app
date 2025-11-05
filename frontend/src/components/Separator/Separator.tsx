import Box from '@ui/Box';
import { ReactElement } from 'react';

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
  return (
    <Box
      data-testid="separator"
      sx={(theme) => ({
        width: '50%',
        borderBottom: '2px solid',
        borderColor: theme.palette.divider,
        ...(orientation === 'left' ? { marginRight: 1 } : { marginLeft: 1 }),
      })}
    />
  );
};

export default Separator;
