import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ReactElement } from 'react';
import PreCallTest from '../../../pages/PreCallTest';

export type PreCallTestDialogProps = {
  isPreCallTestOpen: boolean;
  setIsPreCallTestOpen: (open: boolean) => void;
};

/**
 * PreCallTestDialog Component
 *
 * This component renders a dialog for network connectivity testing in the waiting room.
 * @param {PreCallTestDialogProps} props - The props for the component.
 *   @property {boolean} isPreCallTestOpen - Whether the dialog is open.
 *   @property {Function} setIsPreCallTestOpen - Function to set the open state of the dialog.
 * @returns {ReactElement} The PreCall test dialog component.
 */
const PreCallTestDialog = ({
  isPreCallTestOpen,
  setIsPreCallTestOpen,
}: PreCallTestDialogProps): ReactElement => {
  const handleClose = () => {
    setIsPreCallTestOpen(false);
  };

  return (
    <Dialog open={isPreCallTestOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
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
      <DialogContent sx={{ p: 0 }}>
        <PreCallTest onModalClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
};

export default PreCallTestDialog;
