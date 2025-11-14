import { Box as MUIBox, BoxProps as MUIBoxProps } from '@mui/material';
import React from 'react';

// Support "component" with intrinsic attributes
type BoxProps<C extends React.ElementType = 'div'> = MUIBoxProps<C, { component?: C }>;

const Box = <C extends React.ElementType = 'div'>(props: BoxProps<C>) => {
  return <MUIBox {...props} />;
};

export default Box;
