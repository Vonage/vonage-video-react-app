import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import VividIcon from '@ui/components/VividIcon';
import createRoomWizard$ from '../../context/createRoomWizardContext';
import CreateMeetingButton from '../CreateMeetingButton';
import { testIds } from './testIds';

export { testIds } from './testIds';

export type CreateRoomWizardFooterActionsProps = {
  onClose: () => void;
};

/**
 * Create meeting on the details step; on the share step, the two exits: close the wizard, or join the meeting now.
 */
const CreateRoomWizardFooterActions = ({
  onClose,
}: CreateRoomWizardFooterActionsProps): ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const activeStep = createRoomWizard$.use.select((state) => state.activeStep);
  const sessionKey = createRoomWizard$.use.select((state) => state.sessionKey);

  if (activeStep === 'details') return <CreateMeetingButton />;

  const joinNow = () => {
    void navigate(`/waiting-room/${sessionKey}`);
  };

  return (
    <>
      <button
        type="button"
        data-testid={testIds.doneButton}
        onClick={onClose}
        className="h-10 cursor-pointer rounded-vera-medium border border-vera-primary px-4 font-vera-plain text-vera-body-base-semibold text-vera-primary hover:bg-vera-primary/10"
      >
        {t('createRoomWizard.done')}
      </button>
      <button
        type="button"
        data-testid={testIds.joinButton}
        onClick={joinNow}
        className="flex h-10 cursor-pointer items-center gap-2 rounded-vera-medium bg-vera-primary px-4 font-vera-plain text-vera-body-base-semibold text-vera-on-primary hover:brightness-90"
      >
        <VividIcon name="enter-line" customSize={-5} style={{ color: 'var(--vera-on-primary)' }} />
        {t('createRoomWizard.joinNow')}
      </button>
    </>
  );
};

export default CreateRoomWizardFooterActions;
