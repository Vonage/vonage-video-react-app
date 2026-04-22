import Box from '@mui/material/Box';
import { ReactElement } from 'react';

export type SeparatorProps = {
  orientation?: 'left' | 'right';
  width?: string;
};

/**
 * Separator Component
 *
 * This component renders a horizontal line with customizable orientation that is set to left by default.
 * @param {SeparatorProps} props - the props for the component.
 *  @property {'left' | 'right'} orientation - whether the separator is oriented to the left or right
 *  @property {string} width - the width of the separator.
 * @returns {ReactElement} The separator component.
 */
const Separator = ({ orientation = 'left', width = '50%' }: SeparatorProps): ReactElement => {
  return (
    <Box
      data-testid="separator"
      sx={{
        width: width,
        borderBottom: '1px solid',
        ...(orientation === 'left' ? { marginRight: 1 } : { marginLeft: 1 }),
      }}
      className="border-vera-border!"
    />
  );
};

export default Separator;
