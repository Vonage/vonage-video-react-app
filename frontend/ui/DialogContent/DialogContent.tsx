import {
  DialogContent as MUIDialogContent,
  DialogContentProps as MUIDialogContentProps,
} from '@mui/material';

type DialogContentProps = MUIDialogContentProps;

const DialogContent = ({ ...dialogContentProps }: DialogContentProps) => {
  return <MUIDialogContent {...dialogContentProps} />;
};

export default DialogContent;
