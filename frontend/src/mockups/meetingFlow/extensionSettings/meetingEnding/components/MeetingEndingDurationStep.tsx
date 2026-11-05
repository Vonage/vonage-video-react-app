import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import disabledButtonClassName from '../../../constants/disabledButtonClassName';
import DurationChoices from '../../components/DurationChoices';

export type MeetingEndingDurationStepProps = {
  initialMinutes: number | null;
  onCancel: () => void;
};

/**
 * Second step: pick 20, 40 or 60 minutes, then Confirm.
 */
const MeetingEndingDurationStep = ({
  initialMinutes,
  onCancel,
}: MeetingEndingDurationStepProps): ReactElement => {
  const { t } = useTranslation();
  const [selectedMinutes, setSelectedMinutes] = useState(initialMinutes);

  return (
    <>
      <DialogTitle id="mockup-meeting-ending-title">
        {t('meetingFlow.meetingEnding.chooseDuration')}
      </DialogTitle>
      <DialogContent>
        <DurationChoices selectedMinutes={selectedMinutes} onSelect={setSelectedMinutes} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{t('meetingFlow.meetingEnding.cancel')}</Button>
        <Button
          variant="contained"
          disabled={selectedMinutes === null}
          className={disabledButtonClassName}
        >
          {t('meetingFlow.meetingEnding.confirm')}
        </Button>
      </DialogActions>
    </>
  );
};

export default MeetingEndingDurationStep;
