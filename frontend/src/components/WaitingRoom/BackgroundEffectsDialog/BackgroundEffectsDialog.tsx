import { Dialog } from '@mui/material';
import { ReactElement } from 'react';
import BackgroundEffects from '../../MeetingRoom/BackgroundEffects/BackgroundEffects';

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
      <BackgroundEffects
        handleClose={() => setBackgroundEffectsOpen(false)}
        isOpen={backgroundEffectsOpen}
        fromPreview
      />
    </Dialog>
  );
};

export default BackgroundEffectsDialog;
