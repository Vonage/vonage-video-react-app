import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import VividIcon from '@ui/components/VividIcon';
import createRoomWizard$ from '../../context/createRoomWizardContext';
import CreateMeetingButton from '../CreateMeetingButton';

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
      <Button variant="outlined" onClick={onClose}>
        {t('createRoomWizard.done')}
      </Button>
      <Button
        variant="contained"
        onClick={joinNow}
        startIcon={
          <VividIcon
            name="enter-line"
            customSize={-5}
            style={{ color: 'var(--vera-on-primary)' }}
          />
        }
      >
        {t('createRoomWizard.joinNow')}
      </Button>
    </>
  );
};

export default CreateRoomWizardFooterActions;
