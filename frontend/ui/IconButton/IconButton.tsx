import { IconButton as MUIIconButton, IconButtonProps as MUIIconButtonProps } from '@mui/material';

type IconButtonProps = MUIIconButtonProps;

const IconButton = (iconButtonProps: IconButtonProps) => {
  return <MUIIconButton {...iconButtonProps} />;
};

export default IconButton;
