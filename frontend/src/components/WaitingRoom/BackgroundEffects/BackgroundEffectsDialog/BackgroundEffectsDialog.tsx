import { Dialog, DialogContent } from '@mui/material';
import { ReactElement } from 'react';
import BackgroundEffectsLayout from '../BackgroundEffectsLayout/Index';

interface BackgroundEffectsDialogProps {
  backgroundEffectsOpen: boolean;
  setBackgroundEffectsOpen: (open: boolean) => void;
}

/**
 * BackgroundEffectsDialog Component
 *
 * This component renders a dialog for background effects in the waiting room.
 * @param {BackgroundEffectsDialogProps} props - The props for the component.
 *   @property {boolean} backgroundEffectsOpen - Whether the dialog is open.
 *   @property {Function} setBackgroundEffectsOpen - Function to set the open state of the dialog.
 * @returns {ReactElement} The background effects dialog component.
 */
const BackgroundEffectsDialog = ({
  backgroundEffectsOpen,
  setBackgroundEffectsOpen,
}: BackgroundEffectsDialogProps): ReactElement | false => {
  return (
    <Dialog
      open={backgroundEffectsOpen}
      onClose={() => setBackgroundEffectsOpen(false)}
      maxWidth="lg"
      fullWidth
    >
      <DialogContent>
        <BackgroundEffectsLayout
          isOpen={backgroundEffectsOpen}
          handleClose={() => setBackgroundEffectsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BackgroundEffectsDialog;
