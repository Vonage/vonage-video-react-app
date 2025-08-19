import { Dialog, DialogContent } from '@mui/material';
import { ReactElement } from 'react';
import BackgroundEffectsLayout from '../BackgroundEffectsLayout/BackgroundEffectsLayout';

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
  return (
    <Dialog
      open={isBackgroundEffectsOpen}
      onClose={() => setIsBackgroundEffectsOpen(false)}
      maxWidth="lg"
      fullWidth
    >
      <DialogContent>
        <BackgroundEffectsLayout
          isOpen={isBackgroundEffectsOpen}
          handleClose={() => setIsBackgroundEffectsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BackgroundEffectsDialog;
