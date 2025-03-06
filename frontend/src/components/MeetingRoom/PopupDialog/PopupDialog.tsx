import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { ReactElement } from 'react';

export type DialogTexts = {
  title?: string;
  contents: string;
  primaryActionText: string;
  secondaryActionText: string;
};

export type DialogProps = {
  isOpen: boolean;
  handleClose: () => void;
  handleActionClick: () => void;
  actionText: DialogTexts;
};

/**
 * PopupDialog Component
 *
 * Reusable pop-up dialog component that opens when a certain action is performed such as starting/stopping an archive,
 * or muting a participant.
 * @param {DialogProps} props - The props for the component.
 *  @property {boolean} isOpen - Whether the pop-up dialog component is opened.
 *  @property {() => void} handleClose - Function to close the pop-up dialog component.
 *  @property {() => void} handleActionClick - Function that handles the action when the primary action button is clicked.
 *  @property {DialogTexts} actionText - The text that gets displayed in the pop-up component.
 * @returns {ReactElement} - The PopupDialog component.
 */
const PopupDialog = ({
  isOpen,
  handleClose,
  handleActionClick,
  actionText,
}: DialogProps): ReactElement => {
  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{actionText.title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">{actionText.contents}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{actionText.secondaryActionText}</Button>
        <Button onClick={handleActionClick} autoFocus data-testId="popup-dialog-primary-button">
          {actionText.primaryActionText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PopupDialog;
