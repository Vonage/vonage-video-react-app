import {
  DialogActions as MUIDialogActions,
  DialogActionsProps as MUIDialogActionsProps,
} from '@mui/material';

type DialogActionsProps = MUIDialogActionsProps;

const DialogActions = ({ ...dialogActionsProps }: DialogActionsProps) => {
  return <MUIDialogActions {...dialogActionsProps} />;
};

export default DialogActions;
