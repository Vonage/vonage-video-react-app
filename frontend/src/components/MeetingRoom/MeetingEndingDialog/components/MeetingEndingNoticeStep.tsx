import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export type MeetingEndingNoticeStepProps = {
  isAtLimit: boolean;
  onGotIt: () => void;
  onExtend: () => void;
};

const MeetingEndingNoticeStep = ({
  isAtLimit,
  onGotIt,
  onExtend,
}: MeetingEndingNoticeStepProps): ReactElement => {
  const { t } = useTranslation();

  return (
    <>
      <DialogTitle id="meeting-ending-dialog-title">
        {t('meetingExtension.endingTitle')}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t('meetingExtension.endingBody')}
          {isAtLimit && ` ${t('meetingExtension.cannotExtend')}`}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onGotIt}>{t('meetingExtension.gotIt')}</Button>
        {!isAtLimit && (
          <Button variant="contained" onClick={onExtend}>
            {t('meetingExtension.extend')}
          </Button>
        )}
      </DialogActions>
    </>
  );
};

export default MeetingEndingNoticeStep;
