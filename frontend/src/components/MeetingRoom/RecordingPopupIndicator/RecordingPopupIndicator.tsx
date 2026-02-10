import { ReactElement, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useRoomName from '@hooks/useRoomName';
import PopupDialog, { type DialogTexts } from '../PopupDialog';

type RecordingPopUpIndicatorProps = {
  shouldPromptRecordingConsent?: boolean;
};

const RecordingPopUpIndicator = ({
  shouldPromptRecordingConsent = false,
}: RecordingPopUpIndicatorProps): ReactElement => {
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
