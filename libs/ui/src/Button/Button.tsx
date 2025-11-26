import { Button as MUIButton, ButtonProps as MUIButtonProps } from '@mui/material';

type ButtonProps = MUIButtonProps;

const Button = (buttonProps: ButtonProps) => {
  return <MUIButton {...buttonProps} />;
};

export default Button;
