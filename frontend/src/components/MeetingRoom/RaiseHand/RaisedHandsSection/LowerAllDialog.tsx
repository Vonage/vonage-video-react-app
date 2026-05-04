import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export type LowerAllDialogProps = {
  open: boolean;
  raisedHandCount: number;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * LowerAllDialog Component
 *
 * Confirmation dialog before lowering all raised hands.
 * Prevents accidental mass-lower by requiring explicit user confirmation.
 * @param {LowerAllDialogProps} props
 * @returns {ReactElement}
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
      data-testid="lower-all-dialog"
    >
      <DialogTitle id="lower-all-dialog-title">{t('raiseHand.lowerAll.dialogTitle')}</DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          {t('raiseHand.lowerAll.dialogBody', { count: raisedHandCount })}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} data-testid="lower-all-cancel-button">
          {t('button.cancel')}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="primary"
          data-testid="lower-all-confirm-button"
          autoFocus
        >
          {t('raiseHand.lowerAll.confirmButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LowerAllDialog;
