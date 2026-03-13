import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useRoomName from '@hooks/useRoomName';
import { startArchiving, stopArchiving } from '@api/archiving';
import useSessionContext from '@hooks/useSessionContext';
import ToolbarButton from '../ToolbarButton';
import PopupDialog, { DialogTexts } from '../PopupDialog';
import Tooltip from '@mui/material/Tooltip';
import useTheme from '@ui/theme';
import VividIcon from '@components/VividIcon';
import classNames from 'classnames';
import { env } from '../../../env';
import { RECORDING_START_DELAY } from '@utils/constants';

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
  const theme = useTheme();
  const { archiveId, markArchiveStartRequestedBySelf, resetArchiveStartRequestedBySelf } =
    useSessionContext();
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

  const handleDialogClick = (action: 'start' | 'stop') => {
    if (action === 'start') {
      if (!archiveId && roomName) {
        markArchiveStartRequestedBySelf();
        setTimeout(async () => {
          try {
            await startArchiving(roomName);
          } catch (err) {
            resetArchiveStartRequestedBySelf();
            console.log(err);
          }
        }, RECORDING_START_DELAY);
      }
    } else if (archiveId && roomName) {
      void stopArchiving(roomName, archiveId);
    }
  };

  const handleActionClick = () => {
    handleClose();
    void handleDialogClick(isRecording ? 'stop' : 'start');
  };

  return (
    env.ALLOW_ARCHIVING && (
      <>
        <Tooltip title={title} aria-label={t('recording.tooltip.ariaLabel')}>
          <ToolbarButton
            onClick={handleButtonClick}
            data-testid="archiving-button"
            className={classNames({ recording: isRecording })}
            icon={
              <VividIcon
                name={isRecording ? 'radio-checked-2-line' : 'radio-checked-2-solid'}
                customSize={-5}
                style={{
                  color: theme.colors.onSecondary,
                }}
              />
            }
            sx={{
              marginTop: isOverflowButton ? '0px' : '4px',
              backgroundColor: isRecording
                ? `${theme.colors.onSecondary}55`
                : theme.colors.darkGrey,
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
