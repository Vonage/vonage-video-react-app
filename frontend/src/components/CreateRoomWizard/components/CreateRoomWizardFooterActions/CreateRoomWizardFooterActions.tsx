import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import VividIcon from '@ui/components/VividIcon';
import createRoomWizard$ from '../../context/createRoomWizardContext';

export type CreateRoomWizardFooterActionsProps = {
  onClose: () => void;
};

const CreateRoomWizardFooterActions = ({
  onClose,
}: CreateRoomWizardFooterActionsProps): ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const sessionKey = createRoomWizard$.use.select((state) => state.sessionKey);

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
