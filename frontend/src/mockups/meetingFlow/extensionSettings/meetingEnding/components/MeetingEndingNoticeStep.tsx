import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMeetingTabCopy from '../../hooks/useMeetingTabCopy';

export type MeetingEndingNoticeStepProps = {
  onExtend: () => void;
};

/**
 * First step: the meeting is about to end, with Extend unless the 2 h cap is used.
 */
const MeetingEndingNoticeStep = ({ onExtend }: MeetingEndingNoticeStepProps): ReactElement => {
  const { t } = useTranslation();
  const { isAtCap } = useMeetingTabCopy();

  return (
    <>
      <DialogTitle id="mockup-meeting-ending-title">
        {t('meetingFlow.meetingEnding.title')}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t('meetingFlow.meetingEnding.body')}
          {isAtCap && ` ${t('meetingFlow.meetingEnding.cannotExtend')}`}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button>{t('meetingFlow.meetingEnding.gotIt')}</Button>
        {!isAtCap && (
          <Button variant="contained" onClick={onExtend}>
            {t('meetingFlow.meetingEnding.extend')}
          </Button>
        )}
      </DialogActions>
    </>
  );
};

export default MeetingEndingNoticeStep;
