import { ReactElement, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useRoomName from '@hooks/useRoomName';
import PopupDialog, { type DialogTexts } from '../PopupDialog';
import useSessionContext from '@hooks/useSessionContext';

type RecordingPopUpIndicatorProps = {
  shouldPromptRecordingConsent?: boolean;
  onNotified?: () => void;
};

/**
 * RecordingPopUpIndicator component displays a popup dialog to prompt the user for recording consent.
 * @param {RecordingPopUpIndicatorProps} props - The props for the component.
 *  @property {boolean} shouldPromptRecordingConsent - Flag indicating whether to prompt for recording consent.
 * @returns ReactElement representing the recording consent popup dialog.
 */
const RecordingPopUpIndicator = ({
  shouldPromptRecordingConsent = false,
  onNotified,
}: RecordingPopUpIndicatorProps): ReactElement => {
  const { setRecordingAlreadyNotified } = useSessionContext();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const roomName = useRoomName();

  const [hasBeenNotified, setHasBeenNotified] = useState<boolean>(false);

  const actionText = useMemo<DialogTexts>(() => {
    return {
      title: t('recording.consent.dialog.title'),
      contents: t('recording.consent.dialog.content'),
      primaryActionText: t('recording.consent.dialog.accept'),
      secondaryActionText: t('recording.consent.dialog.decline'),
    };
  }, [t]);

  const redirectToGoodbye = () => {
    navigate('/goodbye', {
      state: {
        header: t('recording.consent.goodbye.header'),
        caption: t('recording.consent.goodbye.message'),
        roomName,
        isSelfDeclinedRecording: true,
      },
    });
  };

  const handleDecline = () => {
    setHasBeenNotified(true);
    redirectToGoodbye();
  };

  const handleActionClick = () => {
    setHasBeenNotified(true);
    setRecordingAlreadyNotified(true);
    onNotified?.();
  };

  const shouldOpenDialog = shouldPromptRecordingConsent && hasBeenNotified === false;

  return (
    <PopupDialog
      isOpen={shouldOpenDialog}
      handleClose={handleDecline}
      handleActionClick={handleActionClick}
      actionText={actionText}
    />
  );
};

export default RecordingPopUpIndicator;
