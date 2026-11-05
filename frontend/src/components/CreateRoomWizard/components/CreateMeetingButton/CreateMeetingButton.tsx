import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import { runtime$ } from '@core/stores';
import generateRoomName from '../../../../utils/generateRoomName';
import createRoomWizard$ from '../../context/createRoomWizardContext';
import getCreateSessionPayload from '../../helpers/getCreateSessionPayload';
import useIsMeetingStartValid from '../../hooks/useIsMeetingStartValid';
import useMeetingDraft from '../../hooks/useMeetingDraft';

const CreateMeetingButton = (): ReactElement => {
  const { t } = useTranslation();
  const videoClient = runtime$.useVideoClient();
  const draft = useMeetingDraft();
  const isStartValid = useIsMeetingStartValid();
  const { showShareStep } = createRoomWizard$.use.actions();
  const [isCreating, setIsCreating] = useState(false);

  const createMeeting = async () => {
    const payload = getCreateSessionPayload({ draft, fallbackRoomName: generateRoomName() });

    setIsCreating(true);
    const { sessionKey } = await videoClient
      .createSession(payload)
      .finally(() => setIsCreating(false));

    showShareStep(sessionKey);
  };

  return (
    <Button
      variant="contained"
      className="disabled:bg-vera-disabled! disabled:text-vera-text-disabled!"
      disabled={!isStartValid || isCreating}
      onClick={() => void createMeeting()}
    >
      {t('createRoomWizard.createMeeting')}
    </Button>
  );
};

export default CreateMeetingButton;
