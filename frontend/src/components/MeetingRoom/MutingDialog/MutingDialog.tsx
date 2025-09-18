import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import { Stream } from '@vonage/client-sdk-video';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import useSessionContext from '../../../hooks/useSessionContext';

type MutingDialogTexts = {
  contents: string;
  primaryActionText: string;
  secondaryActionText: string;
};

export type MutingDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  stream?: Stream;
};

/**
 * MutingDialog Component
 *
 * Dialog to confirm force muting a participant.
 * @param {MutingDialogProps} props - The props for the component.
 *  @property {boolean} isOpen - Whether the dialog should be shown.
 *  @property {(isOpen: boolean) => void} setIsOpen - Function to show or hide the dialog.
 *  @property {Stream} stream - The stream that can potentially be muted.
 * @returns {ReactElement} - The MutingDialog component.
 */
const MutingDialog = ({ isOpen, setIsOpen, stream }: MutingDialogProps): ReactElement => {
  const { t } = useTranslation();
  const { forceMute } = useSessionContext();
  const muteParticipantText: MutingDialogTexts = {
    contents: t('participants.mute.dialog.content', { participantName: stream?.name }),
    primaryActionText: t('button.mute'),
    secondaryActionText: t('button.cancel'),
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleActionClick = () => {
    if (forceMute && stream) {
      forceMute(stream);
      handleClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {muteParticipantText.contents}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{muteParticipantText.secondaryActionText}</Button>
        <Button onClick={handleActionClick} autoFocus>
          {muteParticipantText.primaryActionText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MutingDialog;
