import { ButtonBase as MUIButtonBase, ButtonBaseProps as MUIButtonBaseProps } from '@mui/material';

export type ButtonBaseProps = MUIButtonBaseProps;

const ButtonBase = (buttonBaseProps: ButtonBaseProps) => {
  return <MUIButtonBase {...buttonBaseProps} />;
};

export default ButtonBase;
