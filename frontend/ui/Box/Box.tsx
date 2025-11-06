import { Box as MUIBox, BoxProps as MUIBoxProps } from '@mui/material';

type BoxProps = MUIBoxProps;

const Box = ({ ...boxProps }: BoxProps) => {
  return <MUIBox {...boxProps} />;
};

export default Box;
