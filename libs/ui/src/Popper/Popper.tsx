import { Popper as MUIPopper, PopperProps as MUIPopperProps } from '@mui/material';

export type PopperProps = MUIPopperProps;

const Popper = (popperProps: PopperProps) => {
  return <MUIPopper {...popperProps} />;
};

export default Popper;
