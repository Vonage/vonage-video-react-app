import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import { Tooltip } from '@mui/material';
import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useRoomName from '../../../hooks/useRoomName';
import ToolbarButton from '../ToolbarButton';
import PopupDialog, { DialogTexts } from '../PopupDialog';
import { startArchiving, stopArchiving } from '../../../api/archiving';
import useSessionContext from '../../../hooks/useSessionContext';
import useConfigContext from '../../../hooks/useConfigContext';

export type ArchivingButtonProps = {
  isOverflowButton?: boolean;
  handleClick?: () => void;
};

/**
 * ArchivingButton Component
 *
 * Displays a button and handles the archiving functionality. If a meeting is currently being recorded,
 * will confirm that a user wishes to stop the recording. If a meeting is not being recorded, prompts
 * the user before starting the archive.
 * @param {ArchivingButtonProps} props - the props for the component
 *  @property {boolean} isOverflowButton - (optional) whether the button is in the ToolbarOverflowMenu
 *  @property {(event?: MouseEvent | TouchEvent) => void} handleClick - (optional) click handler that closes the overflow menu in small viewports.
 * @returns {ReactElement | false} - The ArchivingButton component.
 */
const ArchivingButton = ({
  isOverflowButton = false,
  handleClick,
}: ArchivingButtonProps): ReactElement | false => {
  const { t } = useTranslation();
  const roomName = useRoomName();
  const { archiveId } = useSessionContext();
  const allowArchiving = useConfigContext(
    ({ meetingRoomSettings }) => meetingRoomSettings.allowArchiving
  );
  const isRecording = !!archiveId;
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const title = isRecording ? t('recording.stop.title') : t('recording.start.title');
  const handleButtonClick = () => {
    setIsModalOpen((prev) => !prev);
  };

  const startRecordingText: DialogTexts = {
    title: t('recording.start.dialog.title'),
    contents: t('recording.start.dialog.content'),
    primaryActionText: t('recording.start.title'),
    secondaryActionText: t('button.cancel'),
  };

  const stopRecordingText: DialogTexts = {
    title: t('recording.stop.dialog.title'),
    contents: t('recording.stop.dialog.content'),
    primaryActionText: t('recording.stop.title'),
    secondaryActionText: t('button.cancel'),
  };

  const actionText = isRecording ? stopRecordingText : startRecordingText;

  const handleClose = () => {
    setIsModalOpen(false);

    // If the ArchivingButton is in the ToolbarOverflowMenu, we close the modal and the menu
    if (isOverflowButton && handleClick) {
      handleClick();
    }
  };

  const handleDialogClick = async (action: 'start' | 'stop') => {
    if (action === 'start') {
      if (!archiveId && roomName) {
        try {
          await startArchiving(roomName);
        } catch (err) {
          console.log(err);
        }
      }
    } else if (archiveId && roomName) {
      stopArchiving(roomName, archiveId);
    }
  };

  const handleActionClick = () => {
    handleClose();
    handleDialogClick(isRecording ? 'stop' : 'start');
  };

  return (
    allowArchiving && (
      <>
        <Tooltip title={title} aria-label={t('recording.tooltip.ariaLabel')}>
          <ToolbarButton
            onClick={handleButtonClick}
            data-testid="archiving-button"
            icon={
              <RadioButtonCheckedIcon
                style={{ color: `${isRecording ? 'rgb(239 68 68)' : 'white'}` }}
              />
            }
            sx={{
              marginTop: isOverflowButton ? '0px' : '4px',
            }}
            isOverflowButton={isOverflowButton}
          />
        </Tooltip>
        <PopupDialog
          isOpen={isModalOpen}
          handleClose={handleClose}
          handleActionClick={handleActionClick}
          actionText={actionText}
        />
      </>
    )
  );
};
export default ArchivingButton;
