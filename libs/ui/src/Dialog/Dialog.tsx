import { Dialog as MUIDialog, DialogProps as MUIDialogProps } from '@mui/material';

type DialogProps = MUIDialogProps;

const Dialog = (dialogProps: DialogProps) => {
  return <MUIDialog {...dialogProps} />;
};

export default Dialog;
