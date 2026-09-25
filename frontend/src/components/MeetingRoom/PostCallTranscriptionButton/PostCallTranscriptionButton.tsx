import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { runtime$ } from '@core/stores';
import useSessionContext from '@hooks/useSessionContext';
import ToolbarButton from '../ToolbarButton';
import PopupDialog, { DialogTexts } from '../PopupDialog';
import Tooltip from '@mui/material/Tooltip';
import VividIcon from '@ui/components/VividIcon';
import classNames from 'classnames';
import { env } from '../../../env';
import { RECORDING_START_DELAY } from '@utils/constants';

export type PostCallTranscriptionButton = {
  isOverflowButton?: boolean;
  handleClick?: () => void;
};

/**
 * PostCallTranscriptionButton Component
 *
 * Displays a button and handles the post-call transcription functionality. If a meeting is currently being transcribed,
 * will confirm that a user wishes to stop the post-call transcription. If a meeting is not being transcribed, prompts
 * the user before starting the transcription.
 * @param {PostCallTranscriptionButton} props - the props for the component
 *  @property {boolean} isOverflowButton - (optional) whether the button is in the ToolbarOverflowMenu
 *  @property {(event?: MouseEvent | TouchEvent) => void} handleClick - (optional) click handler that closes the overflow menu in small viewports.
 * @returns {ReactElement | false} - The PostCallTranscriptionButton component.
 */
const PostCallTranscriptionButton = ({
  isOverflowButton = false,
  handleClick,
}: PostCallTranscriptionButton): ReactElement | false => {
  const videoClient = runtime$.useVideoClient();
  const { t } = useTranslation();
  const {
    transcriptionArchiveId,
    setTranscriptionArchiveId,
    markArchiveStartRequestedBySelf,
    resetArchiveStartRequestedBySelf,
    sessionKey,
    connected,
  } = useSessionContext();

  const isTranscribing = !!transcriptionArchiveId;
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const title = isTranscribing ? t('transcribing.stop.title') : t('transcribing.start.title');
  const handleButtonClick = () => {
    setIsModalOpen((prev) => !prev);
  };

  const startTranscribingText: DialogTexts = {
    title: t('transcribing.start.dialog.title'),
    contents: t('transcribing.start.dialog.content'),
    primaryActionText: t('transcribing.start.title'),
    secondaryActionText: t('button.cancel'),
  };

  const stopTranscribingText: DialogTexts = {
    title: t('transcribing.stop.dialog.title'),
    contents: t('transcribing.stop.dialog.content'),
    primaryActionText: t('transcribing.stop.title'),
    secondaryActionText: t('button.cancel'),
  };

  const actionText = isTranscribing ? stopTranscribingText : startTranscribingText;

  const handleClose = () => {
    setIsModalOpen(false);

    // If the PostCallTranscriptionButton is in the ToolbarOverflowMenu, we close the modal and the menu
    if (isOverflowButton && handleClick) {
      handleClick();
    }
  };

  const handleDialogClick = (action: 'start' | 'stop') => {
    if (action === 'start') {
      if (!transcriptionArchiveId && connected) {
        markArchiveStartRequestedBySelf();
        setTimeout(async () => {
          try {
            // Signal transcription intent only. The backend translates this into the
            // concrete Vonage archive options (individual output mode, audio, transcription).
            const archive = await videoClient.startArchive({
              sessionKey: sessionKey!,
              withTranscription: true,
            });
            setTranscriptionArchiveId(archive.id);
          } catch (err) {
            resetArchiveStartRequestedBySelf();
            console.log(err);
          }
        }, RECORDING_START_DELAY);
      }
    } else if (transcriptionArchiveId) {
      // Pass the explicit transcription archive id so we stop the transcription specifically. This
      // matters because a recording and a transcription can run at the same time, so we must target
      // the right one rather than let the backend pick.
      void videoClient.stopArchive({ sessionKey: sessionKey!, archiveId: transcriptionArchiveId });
      setTranscriptionArchiveId(null);
    }
  };

  const handleActionClick = () => {
    handleClose();
    void handleDialogClick(isTranscribing ? 'stop' : 'start');
  };

  return (
    env.ALLOW_POST_CALL_TRANSCRIPTION && (
      <>
        <Tooltip title={title} aria-label={t('transcribing.tooltip.ariaLabel')}>
          <ToolbarButton
            onClick={handleButtonClick}
            data-testid="post-call-transcription-button"
            className={classNames({ transcribing: isTranscribing })}
            icon={
              <VividIcon
                name={isTranscribing ? 'radio-checked-2-line' : 'radio-checked-2-solid'}
                customSize={-5}
                style={{
                  color: 'var(--vera-on-secondary-light)',
                }}
              />
            }
            style={{
              marginTop: isOverflowButton ? '0px' : '4px',
              backgroundColor: isTranscribing
                ? 'color-mix(in srgb, var(--vera-on-secondary-light) 33%, transparent) !important'
                : undefined,
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
export default PostCallTranscriptionButton;
