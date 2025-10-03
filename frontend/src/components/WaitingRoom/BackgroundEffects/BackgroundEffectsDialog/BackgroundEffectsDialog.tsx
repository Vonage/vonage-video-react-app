import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ReactElement } from 'react';
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

  return (
    <Dialog open={isBackgroundEffectsOpen} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        Background Effects
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
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
