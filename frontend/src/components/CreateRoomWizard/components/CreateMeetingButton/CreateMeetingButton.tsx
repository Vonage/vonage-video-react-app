import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { runtime$ } from '@core/stores';
import generateRoomName from '../../../../utils/generateRoomName';
import createRoomWizard$ from '../../context/createRoomWizardContext';
import getCreateSessionPayload from '../../helpers/getCreateSessionPayload';
import useIsMeetingStartValid from '../../hooks/useIsMeetingStartValid';
import useMeetingDraft from '../../hooks/useMeetingDraft';
import { testIds } from './testIds';

export { testIds } from './testIds';

const CreateMeetingButton = (): ReactElement => {
  const { t } = useTranslation();
  const videoClient = runtime$.useVideoClient();
  const draft = useMeetingDraft();
  const isStartValid = useIsMeetingStartValid();
  const { showShareStep } = createRoomWizard$.use.actions();
  const [isCreating, setIsCreating] = useState(false);
  const isCreateMeetingDisabled = !isStartValid || isCreating;

  const createMeeting = async () => {
    const payload = getCreateSessionPayload({ draft, fallbackRoomName: generateRoomName() });

    setIsCreating(true);
    const { sessionKey } = await videoClient
      .createSession(payload)
      .finally(() => setIsCreating(false));

    showShareStep(sessionKey);
  };

  return (
    <button
      type="button"
      data-testid={testIds.button}
      className="h-10 cursor-pointer rounded-vera-medium bg-vera-primary px-4 font-vera-plain text-vera-body-base-semibold text-vera-on-primary hover:brightness-90 disabled:cursor-default disabled:bg-vera-disabled disabled:text-vera-text-disabled"
      disabled={isCreateMeetingDisabled}
      onClick={() => void createMeeting()}
    >
      {t('createRoomWizard.createMeeting')}
    </button>
  );
};

export default CreateMeetingButton;
