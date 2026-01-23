import { ReactElement, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useRoomName from '@hooks/useRoomName';
import PopupDialog, { type DialogTexts } from '../PopupDialog';

const RecordingPopUpIndicator = (): ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const roomName = useRoomName();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(true);

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

  const handleClose = () => {
    setIsModalOpen(false);
    redirectToGoodbye();
  };

  const handleActionClick = () => {
    setIsModalOpen(false);
  };

  return (
    <PopupDialog
      isOpen={isModalOpen}
      handleClose={handleClose}
      handleActionClick={handleActionClick}
      actionText={actionText}
    />
  );
};

export default RecordingPopUpIndicator;
