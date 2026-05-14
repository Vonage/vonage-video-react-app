import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

export type LowerAllDialogProps = {
  open: boolean;
  raisedHandCount: number;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Confirmation dialog gating the moderator "Lower all hands" action.
 */
const LowerAllDialog = ({
  open,
  raisedHandCount,
  onConfirm,
  onCancel,
}: LowerAllDialogProps): ReactElement => {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="lower-all-dialog-title"
      aria-describedby="lower-all-dialog-description"
      data-testid="lower-all-dialog"
    >
      <DialogTitle id="lower-all-dialog-title">{t('raiseHand.lowerAll.dialogTitle')}</DialogTitle>
      <DialogContent>
        <DialogContentText id="lower-all-dialog-description">
          {t('raiseHand.lowerAll.dialogBody', { count: raisedHandCount })}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} data-testid="lower-all-cancel-button">
          {t('button.cancel')}
        </Button>
        <Button onClick={onConfirm} data-testid="lower-all-confirm-button" autoFocus>
          {t('raiseHand.lowerAll.confirmButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LowerAllDialog;
