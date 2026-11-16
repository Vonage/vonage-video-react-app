import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { runtime$ } from '@core/stores';
import { isNil } from '@common/assertions';
import tryCatch from '@common/execution/tryCatch';
import { isTRPCClientError } from '@trpc/client';
import { handleClientApplicationError } from '@ui/helpers';
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
    const { result: session, error } = await tryCatch(async () =>
      videoClient.createSession(payload)
    );
    setIsCreating(false);

    if (isNil(session)) {
      const failure = isTRPCClientError(error) ? (error.shape ?? error) : error;
      handleClientApplicationError(t('createRoomWizard.tryCreatingAgain'), failure);
      return;
    }

    showShareStep(session.sessionKey);
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
