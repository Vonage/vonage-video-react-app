import { Dialog, DialogContent } from '@mui/material';
import { ReactElement } from 'react';
import BackgroundEffectsLayout from '../BackgroundEffectsLayout/Index';

interface BackgroundEffectsDialogProps {
  backgroundEffectsOpen: boolean;
  setBackgroundEffectsOpen: (open: boolean) => void;
}

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
