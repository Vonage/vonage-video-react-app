import type { PropsWithChildren, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import VividIcon from '@ui/components/VividIcon';
import DialogFrame from '../../components/DialogFrame';
import createRoomWizard$ from '../context/createRoomWizardContext';

/**
 * A saved meeting reopened from the landing list: the same share content as the wizard's last step, without the steps.
 */
const SavedMeetingShareDialog = ({ children }: PropsWithChildren): ReactElement => {
  const { t } = useTranslation();
  const name = createRoomWizard$.use.select((state) => state.name);

  return (
    <DialogFrame title={name || t('meetingFlow.common.untitledMeeting')} size="tall">
      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
      <DialogFrame.Footer>
        <Button
          variant="text"
          color="secondary"
          startIcon={<VividIcon name="inbox-line" customSize={-5} />}
        >
          {t('meetingFlow.landing.upcoming.archive')}
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
      </DialogFrame.Footer>
    </DialogFrame>
  );
};

export default SavedMeetingShareDialog;
