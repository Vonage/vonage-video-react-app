import { Snackbar as MUISnackbar, SnackbarProps as MUISnackbarProps } from '@mui/material';

type SnackbarProps = MUISnackbarProps;

const Snackbar = (snackbarProps: SnackbarProps) => {
  return <MUISnackbar {...snackbarProps} />;
};

export default Snackbar;
