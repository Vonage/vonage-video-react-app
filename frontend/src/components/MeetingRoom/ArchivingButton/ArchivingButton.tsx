import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import { Tooltip } from '@mui/material';
import { ReactElement, useState } from 'react';
import useRoomName from '../../../hooks/useRoomName';
import ToolbarButton from '../ToolbarButton';
import PopupDialog, { DialogTexts } from '../PopupDialog';
import { startArchiving, stopArchiving } from '../../../api/archiving';
import useSessionContext from '../../../hooks/useSessionContext';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';

export type ArchivingButtonProps = {
  handleClickAway: () => void;
};

/**
 * ArchivingButton Component
 *
 * Displays a button and handles the archiving functionality. If a meeting is currently being recorded,
 * will confirm that a user wishes to stop the recording. If a meeting is not being recorded, prompts
 * the user before starting the archive.
 * @param {ArchivingButtonProps} props - The props for the component.
 *  @property {() => void} handleClickAway - click handler that closes the overflow menu in small view port devices.
 * @returns {ReactElement} - The ArchivingButton component.
 */
const ArchivingButton = ({ handleClickAway }: ArchivingButtonProps): ReactElement => {
  const roomName = useRoomName();
  const { archiveId } = useSessionContext();
  const isRecording = !!archiveId;
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const title = isRecording ? 'Stop recording' : 'Start recording';
  const isSmallViewport = useIsSmallViewport();
  const handleButtonClick = () => {
    setIsModalOpen((prev) => !prev);
  };

  const startRecordingText: DialogTexts = {
    title: 'Start Recording?',
    contents:
      'Make sure everyone is ready! You can download the recording from the "Goodbye" page after you leave the room.',
    primaryActionText: 'Start Recording',
    secondaryActionText: 'Cancel',
  };

  const stopRecordingText: DialogTexts = {
    title: 'Stop Recording?',
    contents: 'You can download the recording from the "Goodbye" page after you leave the room.',
    primaryActionText: 'Stop Recording',
    secondaryActionText: 'Cancel',
  };

  const [actionText, setActionText] = useState<DialogTexts>(startRecordingText);

  const handleClose = () => {
    setIsModalOpen(false);
    if (isSmallViewport) {
      handleClickAway();
    }
  };

  const handleDialogClick = async (action: 'start' | 'stop') => {
    if (action === 'start') {
      if (!archiveId && roomName) {
        try {
          setActionText(stopRecordingText);
          await startArchiving(roomName);
        } catch (err) {
          console.log(err);
        }
      }
    } else if (archiveId && roomName) {
      setActionText(startRecordingText);
      stopArchiving(roomName, archiveId);
    }
  };

  const handleActionClick = () => {
    handleClose();
    handleDialogClick(isRecording ? 'stop' : 'start');
  };

  return (
    <>
      <Tooltip title={title} aria-label="video layout">
        <ToolbarButton
          onClick={handleButtonClick}
          data-testid="archiving-button"
          icon={
            <RadioButtonCheckedIcon
              style={{ color: `${isRecording ? 'rgb(239 68 68)' : 'white'}` }}
            />
          }
          sx={{
            marginTop: isSmallViewport ? '0px' : '4px',
          }}
          isSmallViewPort={isSmallViewport}
        />
      </Tooltip>
      <PopupDialog
        isOpen={isModalOpen}
        handleClose={handleClose}
        handleActionClick={handleActionClick}
        actionText={actionText}
      />
    </>
  );
};
export default ArchivingButton;
