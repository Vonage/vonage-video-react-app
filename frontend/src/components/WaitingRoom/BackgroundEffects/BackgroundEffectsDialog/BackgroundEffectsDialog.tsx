import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import DialogContent from '@mui/material/DialogContent';
import VividIcon from '@ui/VividIcon';
import Typography from '@mui/material/Typography';
import BackgroundEffectsLayout from '../../../BackgroundEffects/BackgroundEffectsLayout';

export type BackgroundEffectsDialogProps = {
  isBackgroundEffectsOpen: boolean;
  setIsBackgroundEffectsOpen: (open: boolean) => void;
};

/**
 * BackgroundEffectsDialog Component
 *
 * This component renders a dialog for background effects in the waiting room.
 * @param {BackgroundEffectsDialogProps} props - The props for the component.
 *   @property {boolean} isBackgroundEffectsOpen - Whether the dialog is open.
 *   @property {Function} setIsBackgroundEffectsOpen - Function to set the open state of the dialog.
 * @returns {ReactElement} The background effects dialog component.
 */
const BackgroundEffectsDialog = ({
  isBackgroundEffectsOpen,
  setIsBackgroundEffectsOpen,
}: BackgroundEffectsDialogProps): ReactElement | false => {
  const handleClose = () => {
    setIsBackgroundEffectsOpen(false);
  };
  const { t } = useTranslation();

  return (
    <Dialog open={isBackgroundEffectsOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle className="bg-vera-surface" sx={{ m: 0, p: 2, pl: 3, pt: 3 }}>
        <Typography
          component="div"
          variant="h5"
          className="text-vera-text-secondary"
          sx={{
            fontWeight: 500,
          }}
        >
          {t('backgroundEffects.title')}
        </Typography>
        <IconButton
          aria-label={t('button.close')}
          onClick={handleClose}
          className="text-vera-secondary"
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
          }}
        >
          <VividIcon name="close-line" customSize={-5} />
        </IconButton>
      </DialogTitle>
      <DialogContent className="bg-vera-surface">
        <BackgroundEffectsLayout
          mode="waiting"
          isOpen={isBackgroundEffectsOpen}
          handleClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BackgroundEffectsDialog;
