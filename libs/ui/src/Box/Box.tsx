import { Box as MUIBox, BoxProps as MUIBoxProps } from '@mui/material';
import { ElementType } from 'react';

// Support "component" with intrinsic attributes
export type BoxProps<C extends React.ElementType = 'div'> = MUIBoxProps<C, { component?: C }>;

const Box = <C extends ElementType = 'div'>(props: BoxProps<C>) => {
  return <MUIBox {...props} />;
};

export default Box;
