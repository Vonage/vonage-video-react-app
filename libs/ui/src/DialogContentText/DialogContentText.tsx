import {
  DialogContentText as MUIDialogContentText,
  DialogContentTextProps as MUIDialogContentTextProps,
} from '@mui/material';

export type DialogContentTextProps = MUIDialogContentTextProps;

const DialogContentText = (dialogContentTextProps: DialogContentTextProps) => {
  return <MUIDialogContentText {...dialogContentTextProps} />;
};

export default DialogContentText;
