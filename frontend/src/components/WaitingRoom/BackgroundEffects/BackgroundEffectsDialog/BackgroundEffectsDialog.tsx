import { Dialog } from '@mui/material';
import { ReactElement } from 'react';
import BackgroundEffectsLayout from '../../../MeetingRoom/BackgroundEffectsLayout/BackgroundEffectsLayout';

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
      maxWidth="md"
      fullWidth
    >
      {
        // TODO: use preview! const { toggleBlur, hasBlur } = usePreviewPublisherContext();
      }
      <BackgroundEffectsLayout
        handleClose={() => setBackgroundEffectsOpen(false)}
        isOpen={backgroundEffectsOpen}
        fromPreview
      />
    </Dialog>
  );
};

export default BackgroundEffectsDialog;
