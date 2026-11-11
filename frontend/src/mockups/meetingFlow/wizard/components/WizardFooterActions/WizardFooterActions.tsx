import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import VividIcon from '@ui/components/VividIcon';
import createRoomWizard$ from '../../context/createRoomWizardContext';

/**
 * Create meeting on the details step; on the share step, the two exits: save for later or join now.
 */
const WizardFooterActions = (): ReactElement => {
  const { t } = useTranslation();
  const activeStep = createRoomWizard$.use.select((state) => state.activeStep);
  const { goNext } = createRoomWizard$.use.actions();

  if (activeStep === 'share') {
    return (
      <>
        <Button
          variant="outlined"
          startIcon={
            <VividIcon
              name="bookmark-line"
              customSize={-5}
              style={{ color: 'var(--vera-primary)' }}
            />
          }
        >
          {t('meetingFlow.wizard.saveForLater')}
        </Button>
        <Button
          variant="contained"
          startIcon={
            <VividIcon
              name="enter-line"
              customSize={-5}
              style={{ color: 'var(--vera-on-primary)' }}
            />
          }
        >
          {t('meetingFlow.wizard.joinNow')}
        </Button>
      </>
    );
  }

  return (
    <Button variant="contained" onClick={goNext}>
      {t('meetingFlow.wizard.createMeeting')}
    </Button>
  );
};

export default WizardFooterActions;
