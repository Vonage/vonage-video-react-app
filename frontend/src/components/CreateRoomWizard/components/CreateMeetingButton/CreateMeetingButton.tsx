import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { notifications$, runtime$ } from '@core/stores';
import { isTRPCClientError } from '@trpc/client';
import { handleClientApplicationError } from '@ui/helpers';
import generateRoomName from '../../../../utils/generateRoomName';
import createRoomWizard$ from '../../context/createRoomWizardContext';
import getCreateSessionPayload from '../../helpers/getCreateSessionPayload';
import useIsMeetingStartValid from '../../hooks/useIsMeetingStartValid';
import useMeetingDraft from '../../hooks/useMeetingDraft';
import useIsMeetingNameValid from '../../hooks/useIsMeetingNameValid';
import isMeetingStartValid from '../../helpers/isMeetingStartValid';
import { testIds } from './testIds';

export { testIds } from './testIds';

const CreateMeetingButton = (): ReactElement => {
  const { t } = useTranslation();
  const videoClient = runtime$.useVideoClient();
  const draft = useMeetingDraft();
  const isStartValid = useIsMeetingStartValid();
  const isNameValid = useIsMeetingNameValid();
  const { showShareStep } = createRoomWizard$.use.actions();
  const [isCreating, setIsCreating] = useState(false);
  const isCreateMeetingDisabled = !isNameValid || !isStartValid || isCreating;

  const createMeeting = async () => {
    if (isCreating) return;

    setIsCreating(true);

    try {
      const hasPastStart = draft.isScheduled && !isMeetingStartValid({ ...draft, now: Date.now() });

      if (hasPastStart) {
        notifications$.actions.push({
          type: 'warning',
          message: t('createRoomWizard.details.schedule.startInPast'),
          expirationMs: null,
        });
        return;
      }

      const payload = getCreateSessionPayload({ draft, fallbackRoomName: generateRoomName() });
      const { sessionKey } = await videoClient.createSession(payload);

      showShareStep(sessionKey);
    } catch (error) {
      const failure = isTRPCClientError(error) ? (error.shape ?? error) : error;
      handleClientApplicationError(t('createRoomWizard.tryCreatingAgain'), failure);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <button
      type="button"
      data-testid={testIds.button}
      className="h-10 cursor-pointer rounded-vera-medium bg-vera-primary px-4 font-vera-plain text-vera-body-base-semibold text-vera-on-primary enabled:hover:bg-vera-primary-hover disabled:cursor-default disabled:bg-vera-disabled disabled:text-vera-text-disabled"
      disabled={isCreateMeetingDisabled}
      onClick={() => void createMeeting()}
    >
      {t('createRoomWizard.createMeeting')}
    </button>
  );
};

export default CreateMeetingButton;
